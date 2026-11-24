"""Testes do scripts/gerar_dados_dashboard.py (o Python que alimenta o dashboard).

Rodar da raiz do repositório:  python -m pytest tests/ -q

Os números esperados são os oficiais do projeto (os mesmos dos notebooks 02 e 03 e do plano). Os testes de 1 a 9
seguem a lista da tarefa 2.3 do plano; no fim há alguns testes extras (formato do JSON e validações da carga).
"""

import hashlib
import importlib.util
import json
from pathlib import Path

import pandas as pd
import pytest

RAIZ = Path(__file__).resolve().parent.parent

CAMINHO_ORIGINAL = RAIZ / "dados" / "original" / "KaggleV2-May-2016.csv"
CAMINHO_TRATADA = RAIZ / "dados" / "tratados" / "consultas_tratadas.csv"
CAMINHO_PAINEL = RAIZ / "dashboard" / "public" / "dados" / "painel.json"

# SHA-256 conferidos em 2026-11-23 (regras globais do plano): os dados não podem mudar sem a gente perceber
HASH_ORIGINAL = "9132d3e7d0246617df9041d3764f20ad6f08e7b0d9f0997fa254fc5e52eda27d"
HASH_TRATADA = "3b309578c06e1e5fa5f424606ec7edeb618c89f2d3a09f3dcd195d49bb7c20b9"

# Posições das colunas de cada linha de `contagens` (contrato 2)
I_IDADE, I_DIA, I_BAIRRO, I_ESPERA, I_CONSULTAS, I_FALTAS = range(6)


def sha256_do_arquivo(caminho):
    sha = hashlib.sha256()
    with open(caminho, "rb") as arquivo:
        for bloco in iter(lambda: arquivo.read(1 << 20), b""):
            sha.update(bloco)
    return sha.hexdigest()


@pytest.fixture(scope="module")
def gerador():
    # O script não é um pacote: carrega o arquivo direto, como um módulo
    caminho = RAIZ / "scripts" / "gerar_dados_dashboard.py"
    especificacao = importlib.util.spec_from_file_location("gerar_dados_dashboard", caminho)
    modulo = importlib.util.module_from_spec(especificacao)
    especificacao.loader.exec_module(modulo)
    return modulo


@pytest.fixture(scope="module")
def base(gerador):
    # A base é carregada uma vez só por módulo de teste
    return gerador.carregar_base(CAMINHO_TRATADA)


@pytest.fixture(scope="module")
def painel(gerador, base):
    # O painel montado agora, na memória (o do disco só é usado no teste 9)
    return gerador.montar_painel(base, sha256_do_arquivo(CAMINHO_TRATADA))


def somar_contagens(painel, filtro=lambda linha: True):
    # Soma consultas e faltas das linhas de `contagens` que passam no filtro
    linhas = [linha for linha in painel["contagens"] if filtro(linha)]
    return sum(l[I_CONSULTAS] for l in linhas), sum(l[I_FALTAS] for l in linhas)


# ---------------------------------------------------------------------------------------------------------------
# 1. Os arquivos de dados são os de sempre
# ---------------------------------------------------------------------------------------------------------------
def test_01_hashes_do_original_e_da_base_tratada_sao_os_oficiais():
    assert sha256_do_arquivo(CAMINHO_ORIGINAL) == HASH_ORIGINAL
    assert sha256_do_arquivo(CAMINHO_TRATADA) == HASH_TRATADA


# ---------------------------------------------------------------------------------------------------------------
# 2. Totais
# ---------------------------------------------------------------------------------------------------------------
def test_02_totais_sao_110521_consultas_22314_faltas_e_taxa_20_2(painel):
    totais = painel["totais"]
    assert totais["consultas"] == 110_521
    assert totais["faltas"] == 22_314
    assert round(totais["taxa"], 1) == 20.2
    assert painel["fonte"]["linhas"] == 110_521
    assert painel["fonte"]["sha256"] == HASH_TRATADA


# ---------------------------------------------------------------------------------------------------------------
# 3. Contagens
# ---------------------------------------------------------------------------------------------------------------
def test_03_contagens_tem_9485_linhas_que_somam_os_totais_e_indices_dentro_da_ordem(painel):
    contagens = painel["contagens"]
    assert len(contagens) == 9_485
    consultas, faltas = somar_contagens(painel)
    assert consultas == painel["totais"]["consultas"]
    assert faltas == painel["totais"]["faltas"]

    ordem = painel["ordem"]
    limites = [len(ordem["faixa_etaria"]), len(ordem["dia_semana"]), len(ordem["bairro"]), len(ordem["faixa_espera"])]
    for linha in contagens:
        assert len(linha) == 6
        for indice, limite in zip(linha[:4], limites):
            assert 0 <= indice < limite
        assert linha[I_CONSULTAS] > 0, "só entram combinações que têm consultas"
        assert 0 <= linha[I_FALTAS] <= linha[I_CONSULTAS]


def test_03b_contagens_esta_ordenada_pelos_indices_sem_repetir_combinacao(painel):
    chaves = [tuple(linha[:4]) for linha in painel["contagens"]]
    assert chaves == sorted(chaves)
    assert len(set(chaves)) == len(chaves)


# ---------------------------------------------------------------------------------------------------------------
# 4. Recortes somados a partir das contagens (é como a página vai calcular)
# ---------------------------------------------------------------------------------------------------------------
def test_04_recortes_somados_das_contagens_batem_com_os_numeros_oficiais(painel):
    ordem = painel["ordem"]
    mesmo_dia = ordem["faixa_espera"].index("Mesmo dia")

    consultas, faltas = somar_contagens(painel, lambda l: l[I_ESPERA] == mesmo_dia)
    assert (consultas, faltas) == (38_562, 1_792)
    assert round(faltas / consultas * 100, 1) == 4.6

    consultas, faltas = somar_contagens(painel, lambda l: l[I_ESPERA] != mesmo_dia)
    assert (consultas, faltas) == (71_959, 20_522)
    assert round(faltas / consultas * 100, 1) == 28.5

    for faixa, esperado in [("13-17", 26.6), ("60+", 15.3)]:
        indice = ordem["faixa_etaria"].index(faixa)
        consultas, faltas = somar_contagens(painel, lambda l: l[I_IDADE] == indice)
        assert round(faltas / consultas * 100, 1) == esperado, faixa


# ---------------------------------------------------------------------------------------------------------------
# 5. Bairros elegíveis
# ---------------------------------------------------------------------------------------------------------------
def test_05_bairros_elegiveis_sao_54_e_santos_dumont_tem_1276_consultas_e_28_9(painel):
    elegiveis = painel["bairros_elegiveis"]
    assert painel["minimo_consultas_bairro"] == 500
    assert len(elegiveis) == 54
    assert elegiveis == sorted(elegiveis)
    assert "SANTOS DUMONT" in elegiveis

    ordem = painel["ordem"]
    assert len(ordem["bairro"]) == 81
    assert ordem["bairro"] == sorted(ordem["bairro"])
    indice = ordem["bairro"].index("SANTOS DUMONT")
    consultas, faltas = somar_contagens(painel, lambda l: l[I_BAIRRO] == indice)
    assert consultas == 1_276
    assert round(faltas / consultas * 100, 1) == 28.9


# ---------------------------------------------------------------------------------------------------------------
# 6. Idade x espera
# ---------------------------------------------------------------------------------------------------------------
def test_06_idade_espera_tem_30_objetos_que_somam_os_totais(painel):
    celulas = painel["idade_espera"]
    assert len(celulas) == 30
    assert sum(c["consultas"] for c in celulas) == painel["totais"]["consultas"]
    assert sum(c["faltas"] for c in celulas) == painel["totais"]["faltas"]

    # Ordem: cada faixa de idade, e dentro dela as 5 faixas de espera
    esperado = [(i, e) for i in painel["ordem"]["faixa_etaria"] for e in painel["ordem"]["faixa_espera"]]
    assert [(c["faixa_etaria"], c["faixa_espera"]) for c in celulas] == esperado

    for celula in celulas:
        assert celula["taxa"] == celula["faltas"] / celula["consultas"] * 100

    # Maior e menor célula, como no notebook 03
    taxas = {(c["faixa_etaria"], c["faixa_espera"]): c["taxa"] for c in celulas}
    assert round(taxas[("13-17", "31+ dias")], 1) == 42.5
    assert round(taxas[("60+", "Mesmo dia")], 1) == 3.1
    assert round(max(taxas.values()), 1) == 42.5 and round(min(taxas.values()), 1) == 3.1


# ---------------------------------------------------------------------------------------------------------------
# 7. Grupo de risco e espera longa
# ---------------------------------------------------------------------------------------------------------------
def conferir_grupo(grupo, mascara_crua, base, celulas, faixas_etarias, faixas_espera):
    # (a) Igual ao cálculo direto pelas colunas cruas (idade e dias_espera)
    consultas = int(mascara_crua.sum())
    faltas = int(base.loc[mascara_crua, "faltou"].sum())
    assert grupo["consultas"] == consultas
    assert grupo["faltas"] == faltas
    assert grupo["taxa"] == faltas / consultas * 100
    assert grupo["pct_consultas"] == consultas / len(base) * 100
    assert grupo["pct_faltas"] == faltas / int(base["faltou"].sum()) * 100

    # (b) Igual à soma das células correspondentes de idade_espera
    das_celulas = [c for c in celulas if c["faixa_etaria"] in faixas_etarias and c["faixa_espera"] in faixas_espera]
    assert grupo["consultas"] == sum(c["consultas"] for c in das_celulas)
    assert grupo["faltas"] == sum(c["faltas"] for c in das_celulas)


def test_07_grupo_de_risco_bate_com_colunas_cruas_celulas_e_notebook_03(painel, base):
    grupo = painel["grupo_risco"]
    assert grupo["faixas_etarias"] == ["13-17", "18-29"]
    assert grupo["faixas_espera"] == ["16-30 dias", "31+ dias"]

    mascara = base["idade"].between(13, 29) & (base["dias_espera"] >= 16)
    conferir_grupo(grupo, mascara, base, painel["idade_espera"], grupo["faixas_etarias"], grupo["faixas_espera"])

    # Números do notebook 03
    assert (grupo["consultas"], grupo["faltas"]) == (5_422, 2_178)
    assert round(grupo["taxa"], 1) == 40.2
    assert round(grupo["pct_consultas"], 1) == 4.9
    assert round(grupo["pct_faltas"], 1) == 9.8

    # Faltas acima da média (etapa 3D): faltas do grupo - consultas do grupo x taxa geral ÷ 100, em número de
    # consultas e sem arredondar. Dá 1.083 e é igual à conta feita com as outras chaves do painel.
    assert round(grupo["faltas_acima_da_media"]) == 1_083
    assert grupo["faltas_acima_da_media"] == grupo["faltas"] - grupo["consultas"] * painel["totais"]["taxa"] / 100
    assert type(grupo["faltas_acima_da_media"]) is float
    assert list(grupo) == [
        "faixas_etarias", "faixas_espera", "consultas", "faltas", "taxa", "pct_consultas", "pct_faltas",
        "faltas_acima_da_media",
    ]


def test_07b_espera_longa_bate_com_colunas_cruas_celulas_e_notebook_03(painel, base):
    longa = painel["espera_longa"]
    assert longa["faixas_etarias"] == painel["ordem"]["faixa_etaria"], "todas as idades"
    assert longa["faixas_espera"] == ["16-30 dias", "31+ dias"]

    mascara = base["dias_espera"] >= 16
    conferir_grupo(longa, mascara, base, painel["idade_espera"], longa["faixas_etarias"], longa["faixas_espera"])

    # Números do notebook 03
    assert (longa["consultas"], longa["faltas"]) == (26_246, 8_584)
    assert round(longa["taxa"], 1) == 32.7
    assert round(longa["pct_consultas"], 1) == 23.7
    assert round(longa["pct_faltas"], 1) == 38.5

    # O mesmo campo, no mesmo formato (a espera longa, que já não aparece na tela, usa a mesma função)
    assert list(longa) == list(painel["grupo_risco"])
    assert longa["faltas_acima_da_media"] == longa["faltas"] - longa["consultas"] * painel["totais"]["taxa"] / 100


# ---------------------------------------------------------------------------------------------------------------
# 8. SMS
# ---------------------------------------------------------------------------------------------------------------
def test_08_sms_geral_bate_com_a_comparacao_crua(painel):
    sms = painel["sms_geral"]
    assert (sms["com"]["consultas"], sms["com"]["faltas"]) == (35_482, 9_784)
    assert round(sms["com"]["taxa"], 1) == 27.6
    assert (sms["sem"]["consultas"], sms["sem"]["faltas"]) == (75_039, 12_530)
    assert round(sms["sem"]["taxa"], 1) == 16.7


def test_08b_sms_espera_tem_10_objetos_mesmo_dia_com_sms_vazio_e_soma_os_totais(painel):
    celulas = painel["sms_espera"]
    assert len(celulas) == 10

    vazia = [c for c in celulas if c["faixa_espera"] == "Mesmo dia" and c["recebeu_sms"] == 1]
    assert len(vazia) == 1
    assert vazia[0]["consultas"] == 0 and vazia[0]["faltas"] == 0
    assert vazia[0]["taxa"] is None

    assert sum(c["consultas"] for c in celulas) == painel["totais"]["consultas"]
    assert sum(c["faltas"] for c in celulas) == painel["totais"]["faltas"]
    # Fora a célula vazia, toda taxa existe
    assert all(c["taxa"] is not None for c in celulas if c["consultas"] > 0)


# ---------------------------------------------------------------------------------------------------------------
# 9. O arquivo do disco não pode ficar desatualizado
# ---------------------------------------------------------------------------------------------------------------
def test_09_painel_json_do_disco_e_igual_ao_que_montar_painel_devolve_agora(painel):
    assert CAMINHO_PAINEL.exists(), "rode: python scripts/gerar_dados_dashboard.py"
    with open(CAMINHO_PAINEL, encoding="utf-8") as arquivo:
        do_disco = json.load(arquivo)
    assert do_disco == painel, "o painel.json está desatualizado: rode python scripts/gerar_dados_dashboard.py"


# ---------------------------------------------------------------------------------------------------------------
# Extras: formato do JSON e funções pequenas
# ---------------------------------------------------------------------------------------------------------------
def percorrer(valor):
    # Todos os valores de dentro do painel, em qualquer nível
    if isinstance(valor, dict):
        for filho in valor.values():
            yield from percorrer(filho)
    elif isinstance(valor, list):
        for filho in valor:
            yield from percorrer(filho)
    else:
        yield valor


def test_extra_painel_so_tem_tipos_nativos_do_python_e_nenhum_nan(painel):
    # np.float64 é subclasse de float e passaria em isinstance; por isso a checagem é pelo tipo exato
    for valor in percorrer(painel):
        assert type(valor) in (int, float, str, type(None)), f"tipo inesperado: {type(valor)} ({valor!r})"
        if type(valor) is float:
            assert valor == valor and valor not in (float("inf"), float("-inf")), "NaN ou infinito no painel"


def test_extra_chaves_do_painel_seguem_o_contrato_2(painel):
    assert list(painel) == [
        "versao", "fonte", "ordem", "totais", "contagens", "minimo_consultas_bairro", "bairros_elegiveis",
        "idade_espera", "grupo_risco", "espera_longa", "sms_geral", "sms_espera",
    ]
    assert painel["versao"] == 1
    assert painel["fonte"]["arquivo"] == "dados/tratados/consultas_tratadas.csv"
    assert painel["ordem"]["faixa_etaria"] == ["0-12", "13-17", "18-29", "30-44", "45-59", "60+"]
    assert painel["ordem"]["faixa_espera"] == ["Mesmo dia", "1-7 dias", "8-15 dias", "16-30 dias", "31+ dias"]
    assert painel["ordem"]["dia_semana"] == ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]


def test_extra_taxa_e_nula_quando_nao_ha_consultas(gerador):
    assert gerador.taxa(0, 0) is None
    assert gerador.taxa(1, 4) == 25.0
    assert gerador.taxa(22_314, 110_521) == 22_314 / 110_521 * 100


def test_extra_gravar_painel_e_deterministico_e_nao_aceita_nan(gerador, painel, tmp_path):
    primeiro, segundo = tmp_path / "um" / "painel.json", tmp_path / "dois" / "painel.json"
    gerador.gravar_painel(painel, primeiro)
    gerador.gravar_painel(painel, segundo)
    assert primeiro.read_bytes() == segundo.read_bytes()
    texto = primeiro.read_bytes()
    assert texto.endswith(b"\n") and b"\r" not in texto
    assert "Terça".encode("utf-8") in texto, "acentos sem escape, em UTF-8"
    with pytest.raises(ValueError):
        gerador.gravar_painel({"taxa": float("nan")}, tmp_path / "nan.json")


def test_extra_carregar_base_falha_com_mensagem_clara(gerador, base, tmp_path):
    # Coluna faltando
    sem_coluna = tmp_path / "sem_coluna.csv"
    base.head(50).drop(columns=["faixa_espera"]).to_csv(sem_coluna, index=False)
    with pytest.raises(ValueError, match="faixa_espera"):
        gerador.carregar_base(sem_coluna)

    # Rótulo fora do contrato 1
    rotulo_errado = tmp_path / "rotulo_errado.csv"
    alterada = base.head(50).copy()
    alterada["faixa_espera"] = alterada["faixa_espera"].astype(str)
    alterada.loc[alterada.index[0], "faixa_espera"] = "Amanhã"
    alterada.to_csv(rotulo_errado, index=False)
    with pytest.raises(ValueError, match="Amanhã"):
        gerador.carregar_base(rotulo_errado)


def test_extra_carregar_base_le_paciente_id_como_texto(base):
    assert pd.api.types.is_string_dtype(base["paciente_id"]) or base["paciente_id"].dtype == object
    assert "." not in base["paciente_id"].iloc[0], "o id não pode virar número com casa decimal"
