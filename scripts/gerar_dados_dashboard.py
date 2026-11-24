"""Gera os números do dashboard: o Python calcula, o React só mostra.

Lê a base tratada (dados/tratados/consultas_tratadas.csv, a mesma da análise) e grava
dashboard/public/dados/painel.json. A página do dashboard não calcula taxa nenhuma por conta própria: ela só soma as
contagens deste arquivo, conforme os filtros que a pessoa escolhe. Assim as definições e os números são os mesmos
do notebook, do README, dos slides e do dashboard.

Uso (da raiz do repositório):
    python scripts/gerar_dados_dashboard.py

O formato do arquivo gerado está descrito no plano (contrato 2) e conferido por tests/test_dados_dashboard.py.
O que este script NÃO faz: não altera a base tratada nem o dados/original/ (só lê) e não usa nenhuma outra fonte.
"""

import hashlib
import json
from pathlib import Path

import pandas as pd

# ---------------------------------------------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------------------------------------------
# Os caminhos partem da pasta do repositório (a pasta acima de scripts/), para o script funcionar de qualquer lugar
RAIZ = Path(__file__).resolve().parent.parent
CAMINHO_BASE = RAIZ / "dados" / "tratados" / "consultas_tratadas.csv"
CAMINHO_PAINEL = RAIZ / "dashboard" / "public" / "dados" / "painel.json"

# Ordem das categorias (o CSV não guarda ordem): os rótulos são exatamente os do contrato da base tratada,
# os mesmos dos notebooks 01, 02 e 03. Se algum rótulo mudar, a carga abaixo falha em vez de seguir com número errado.
ORDEM_FAIXA_ETARIA = ["0-12", "13-17", "18-29", "30-44", "45-59", "60+"]
ORDEM_FAIXA_ESPERA = ["Mesmo dia", "1-7 dias", "8-15 dias", "16-30 dias", "31+ dias"]
ORDEM_DIA_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

# O grupo de maior risco (mesma definição do notebook 03): 13 a 29 anos e espera de 16 dias ou mais
FAIXAS_ETARIAS_RISCO = ["13-17", "18-29"]
FAIXAS_ESPERA_RISCO = ["16-30 dias", "31+ dias"]

# Bairro só entra no ranking do dashboard com 500 consultas ou mais: abaixo disso a taxa balança demais
MINIMO_CONSULTAS_BAIRRO = 500

# As 19 colunas da base tratada, nesta ordem (contrato 1)
COLUNAS_ESPERADAS = [
    "paciente_id", "consulta_id", "sexo", "data_agendamento", "data_consulta", "idade", "bairro",
    "bolsa_familia", "hipertensao", "diabetes", "alcoolismo", "recebeu_sms", "deficiencia", "faltou",
    "dias_espera", "dia_semana", "faixa_etaria", "faixa_espera", "tem_deficiencia",
]


# ---------------------------------------------------------------------------------------------------------------
# Carga e conferência
# ---------------------------------------------------------------------------------------------------------------
def calcular_sha256(caminho):
    # Impressão digital do arquivo: grava no painel de qual base os números saíram
    sha = hashlib.sha256()
    with open(caminho, "rb") as arquivo:
        for bloco in iter(lambda: arquivo.read(1 << 20), b""):
            sha.update(bloco)
    return sha.hexdigest()


def carregar_base(caminho):
    # paciente_id é só um identificador: lido como texto, para não virar número (e perder zeros ou ganhar ".0")
    df = pd.read_csv(caminho, dtype={"paciente_id": str})

    # Conferência 1: as colunas são as do contrato da base tratada
    if list(df.columns) != COLUNAS_ESPERADAS:
        faltando = [c for c in COLUNAS_ESPERADAS if c not in df.columns]
        sobrando = [c for c in df.columns if c not in COLUNAS_ESPERADAS]
        raise ValueError(
            f"As colunas de {caminho} não batem com o contrato da base tratada. "
            f"Faltando: {faltando}. Sobrando: {sobrando}."
        )

    # Conferência 2: nenhum rótulo fora do contrato. Sem isso, uma faixa renomeada sumiria das contas sem avisar
    for coluna, ordem in [
        ("faixa_etaria", ORDEM_FAIXA_ETARIA),
        ("faixa_espera", ORDEM_FAIXA_ESPERA),
        ("dia_semana", ORDEM_DIA_SEMANA),
    ]:
        fora = sorted({str(v) for v in df[coluna].unique()} - set(ordem))
        if fora:
            raise ValueError(f"Rótulo fora do contrato em '{coluna}': {fora}. Esperado: {ordem}.")
    return df


# ---------------------------------------------------------------------------------------------------------------
# Blocos de números
# ---------------------------------------------------------------------------------------------------------------
def taxa(faltas, consultas):
    # Taxa de falta = faltas ÷ consultas, em %, sem arredondar (quem arredonda é a página, ao mostrar).
    # Sem consultas não existe taxa: devolve None, que vira null no JSON (e nunca NaN, que não é JSON válido)
    if consultas == 0:
        return None
    return faltas / consultas * 100


def resumo(df):
    # Mede um recorte (ou a base inteira): quantas consultas, quantas faltas e a taxa
    consultas = int(len(df))
    faltas = int(df["faltou"].sum())
    return {"consultas": consultas, "faltas": faltas, "taxa": taxa(faltas, consultas)}


def montar_ordem(df):
    # As listas de categorias, na ordem em que a página vai mostrá-las. Os índices de `contagens` apontam para elas.
    # Bairros: os 81 da base em ordem alfabética, com o sorted() simples do Python (compara pelos códigos dos
    # caracteres; é determinístico, que é o que importa aqui). A página escolhe como mostrar.
    return {
        "faixa_etaria": list(ORDEM_FAIXA_ETARIA),
        "faixa_espera": list(ORDEM_FAIXA_ESPERA),
        "dia_semana": list(ORDEM_DIA_SEMANA),
        "bairro": sorted(str(b) for b in df["bairro"].unique()),
    }


def montar_contagens(df, ordem):
    # O coração do dashboard: uma linha para cada combinação idade x dia x bairro x espera que tem consultas:
    #   [i_faixa_etaria, i_dia_semana, i_bairro, i_faixa_espera, consultas, faltas]
    # Cada "i_" é a posição do rótulo na lista de `ordem`. Com isso a página soma só as linhas que passam nos
    # filtros e calcula a taxa (faltas ÷ consultas), sem precisar das 110 mil consultas dentro do navegador.
    codigos = pd.DataFrame({"faltou": df["faltou"].to_numpy()})
    for nome, coluna in [
        ("i_faixa_etaria", "faixa_etaria"),
        ("i_dia_semana", "dia_semana"),
        ("i_bairro", "bairro"),
        ("i_faixa_espera", "faixa_espera"),
    ]:
        # Categorical com as categorias exatamente na ordem do contrato: .codes é o índice na lista
        codigos[nome] = pd.Categorical(df[coluna].astype(str), categories=ordem[coluna]).codes
    chaves = ["i_faixa_etaria", "i_dia_semana", "i_bairro", "i_faixa_espera"]
    # Código -1 = rótulo que não está na `ordem`: melhor parar do que somar errado
    assert (codigos[chaves] >= 0).all().all(), "há rótulo fora da ordem"

    # groupby só devolve as combinações que existem (as 9.485 com consultas) e sort=True ordena pelos índices
    agrupado = (
        codigos.groupby(chaves, sort=True)["faltou"].agg(consultas="size", faltas="sum").reset_index()
    )
    # .tolist() entrega int nativo do Python (o json.dumps não grava tipos do numpy)
    return agrupado[chaves + ["consultas", "faltas"]].to_numpy().tolist()


def bairros_elegiveis(df, minimo=MINIMO_CONSULTAS_BAIRRO):
    # Bairros com `minimo` consultas ou mais na base inteira, em ordem alfabética
    por_bairro = df.groupby("bairro").size()
    return sorted(str(b) for b in por_bairro[por_bairro >= minimo].index)


def montar_idade_espera(df):
    # O cruzamento do notebook 03: 6 faixas de idade x 5 de espera = 30 células, na ordem das faixas
    # (cada idade com suas 5 esperas). Célula sem consulta ficaria com taxa nula, mas hoje as 30 têm consultas.
    contagem = df.groupby(["faixa_etaria", "faixa_espera"])["faltou"].agg(["size", "sum"])
    celulas = []
    for idade in ORDEM_FAIXA_ETARIA:
        for espera in ORDEM_FAIXA_ESPERA:
            if (idade, espera) in contagem.index:
                consultas, faltas = (int(v) for v in contagem.loc[(idade, espera)])
            else:
                consultas, faltas = 0, 0
            celulas.append({
                "faixa_etaria": idade,
                "faixa_espera": espera,
                "consultas": consultas,
                "faltas": faltas,
                "taxa": taxa(faltas, consultas),
            })
    return celulas


def montar_grupo(df, faixas_etarias, faixas_espera):
    # Mede um grupo definido por faixas de idade e de espera (faixas_etarias=None quer dizer "todas as idades").
    # Usado para o grupo de maior risco (13 a 29 anos e 16+ dias) e para a espera longa (16+ dias, qualquer idade).
    # Pelas faixas da base tratada: é o mesmo que idade 13-29 e dias_espera >= 16 (o teste confere pelas colunas cruas).
    todas_as_idades = faixas_etarias is None
    if todas_as_idades:
        faixas_etarias = list(ORDEM_FAIXA_ETARIA)
    mascara = df["faixa_espera"].isin(faixas_espera) & df["faixa_etaria"].isin(faixas_etarias)
    recorte = resumo(df[mascara])
    total_consultas = int(len(df))
    total_faltas = int(df["faltou"].sum())
    return {
        "faixas_etarias": list(faixas_etarias),
        "faixas_espera": list(faixas_espera),
        **recorte,
        # Quanto do total de consultas e de faltas cai neste grupo (em %): o grupo pequeno que concentra muita falta
        "pct_consultas": recorte["consultas"] / total_consultas * 100,
        "pct_faltas": recorte["faltas"] / total_faltas * 100,
    }


def montar_sms(df):
    # A comparação do SMS. Devolve (sms_geral, sms_espera).
    # sms_geral é a conta crua: com SMS faltam mais (27,6% x 16,7%). Ela engana, porque o SMS só começa com 3+ dias de
    # espera, e quem espera mais falta mais (correlação espúria).
    # sms_espera abre a mesma conta por faixa de espera, que é onde dá para comparar quem é parecido.
    recebeu = df["recebeu_sms"] == 1
    sms_geral = {"com": resumo(df[recebeu]), "sem": resumo(df[~recebeu])}

    sms_espera = []
    for espera in ORDEM_FAIXA_ESPERA:
        for valor in (0, 1):  # primeiro quem não recebeu, depois quem recebeu
            recorte = df[(df["faixa_espera"] == espera) & (df["recebeu_sms"] == valor)]
            # "Mesmo dia" com SMS tem 0 consultas e taxa nula: o objeto continua na lista, para a página ter as 10 células
            sms_espera.append({"faixa_espera": espera, "recebeu_sms": valor, **resumo(recorte)})
    return sms_geral, sms_espera


# ---------------------------------------------------------------------------------------------------------------
# Montagem e gravação
# ---------------------------------------------------------------------------------------------------------------
def montar_painel(df, sha256):
    # Junta tudo no dicionário do arquivo (contrato 2). A ordem das chaves é a ordem em que aparecem no JSON.
    ordem = montar_ordem(df)
    sms_geral, sms_espera = montar_sms(df)
    return {
        "versao": 1,
        "fonte": {
            "arquivo": CAMINHO_BASE.relative_to(RAIZ).as_posix(),
            "sha256": sha256,  # de qual base saíram estes números
            "linhas": int(len(df)),
        },
        "ordem": ordem,
        "totais": resumo(df),
        "contagens": montar_contagens(df, ordem),
        "minimo_consultas_bairro": MINIMO_CONSULTAS_BAIRRO,
        "bairros_elegiveis": bairros_elegiveis(df, MINIMO_CONSULTAS_BAIRRO),
        "idade_espera": montar_idade_espera(df),
        "grupo_risco": montar_grupo(df, FAIXAS_ETARIAS_RISCO, FAIXAS_ESPERA_RISCO),
        "espera_longa": montar_grupo(df, None, FAIXAS_ESPERA_RISCO),
        "sms_geral": sms_geral,
        "sms_espera": sms_espera,
    }


def gravar_painel(painel, caminho):
    # Grava o JSON em UTF-8, sem escapar acentos, com "\n" no fim (mesmo no Windows) e sem aceitar NaN
    # (allow_nan=False: se aparecer NaN, o script para, em vez de gravar um arquivo que o navegador não lê).
    # Cada chave de primeiro nível fica numa linha e o valor em formato compacto: o arquivo tem milhares de linhas de
    # contagens e assim fica pequeno, estável e fácil de comparar no git. Rodar duas vezes dá o mesmo conteúdo.
    caminho = Path(caminho)
    linhas = []
    for chave, valor in painel.items():
        texto = json.dumps(valor, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
        linhas.append(f"  {json.dumps(chave)}: {texto}")
    conteudo = "{\n" + ",\n".join(linhas) + "\n}\n"

    caminho.parent.mkdir(parents=True, exist_ok=True)
    with open(caminho, "w", encoding="utf-8", newline="\n") as arquivo:
        arquivo.write(conteudo)


def fmt_num(n):
    # 110521 -> "110.521" (ponto de milhar, como nos notebooks)
    return f"{n:,}".replace(",", ".")


def fmt_pct(x):
    # 20.19 -> "20,2%" (só para a mensagem; no JSON a taxa vai sem arredondar)
    return f"{x:.1f}".replace(".", ",") + "%"


def main():
    df = carregar_base(CAMINHO_BASE)
    painel = montar_painel(df, calcular_sha256(CAMINHO_BASE))
    gravar_painel(painel, CAMINHO_PAINEL)

    totais = painel["totais"]
    grupo = painel["grupo_risco"]
    longa = painel["espera_longa"]
    print(f"Base lida: {CAMINHO_BASE.relative_to(RAIZ).as_posix()} (sha256 {painel['fonte']['sha256'][:12]}...)")
    print(f"Totais: {fmt_num(totais['consultas'])} consultas, {fmt_num(totais['faltas'])} faltas, "
          f"taxa {fmt_pct(totais['taxa'])}")
    print(f"Combinações com consultas (linhas de contagens): {fmt_num(len(painel['contagens']))}")
    print(f"Bairros: {len(painel['ordem']['bairro'])} na base, {len(painel['bairros_elegiveis'])} com "
          f"{painel['minimo_consultas_bairro']}+ consultas")
    print(f"Grupo de maior risco: {fmt_num(grupo['consultas'])} consultas, taxa {fmt_pct(grupo['taxa'])}")
    print(f"Espera longa (16+ dias): {fmt_num(longa['consultas'])} consultas, taxa {fmt_pct(longa['taxa'])}")
    print(f"Gravado: {CAMINHO_PAINEL.relative_to(RAIZ).as_posix()} ({fmt_num(CAMINHO_PAINEL.stat().st_size)} bytes)")


if __name__ == "__main__":
    main()
