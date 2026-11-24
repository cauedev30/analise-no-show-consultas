# Redução de faltas em consultas (no-show) em clínicas

Projeto final de **Análise de Dados e BI**, com o professor Daniel Brandão.

**Equipe:** Cauê Franco, Lucio Lima e Daniel Vieira.

## O problema

No-show é quando o paciente marca a consulta e não comparece, sem avisar. A clínica perde capacidade de atendimento:
o horário vago não é reaproveitado e quem estava na fila não consegue vaga. Nos dados deste projeto, cerca de 1 em
cada 5 agendados falta (**20,2%**).

**Pergunta central:** quem tem mais chance de faltar e o que a clínica pode fazer para reduzir isso?

**Setor:** Saúde Privada. A base usada indica consultas da rede pública (tem a coluna de Bolsa Família e bairros de
Vitória, ES) e entra como **aproximação** do comportamento de falta numa clínica. A premissa está explicada na seção
**D** do [processo](docs/processo.md).

## Fonte dos dados

- **Base:** *Medical Appointment No Shows*, do Kaggle: https://www.kaggle.com/datasets/joniarroba/noshowappointments
- **Autor:** Joni Hoppen (Aquarela Analytics).
- **Licença:** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). A base tratada deste repositório é uma
  obra derivada e segue a mesma licença (atribuição, uso não comercial e compartilhamento pela mesma licença).
- **O que tem:** 110.527 consultas e 14 colunas. As consultas vão de 2016-04-29 a 2016-06-08.
- O arquivo original (`dados/original/KaggleV2-May-2016.csv`) **nunca é alterado**: a limpeza só lê esse arquivo e grava o
  resultado em outro lugar (`dados/tratados/`).

**Como os dados foram obtidos.** Baixamos o arquivo do link acima em 2026-11-10: um `.zip` de 2,5 MB com um único CSV,
`KaggleV2-May-2016.csv` (10,7 MB). Esse CSV foi colocado em `dados/original/` sem nenhuma alteração. Não houve coleta
própria, raspagem nem junção com outra base: **é a única fonte de dados do projeto**. O SHA-256 do arquivo é
`9132d3e7d0246617df9041d3764f20ad6f08e7b0d9f0997fa254fc5e52eda27d`, o mesmo do CSV que está dentro do `.zip` baixado e do arquivo enviado ao professor. Os números que
descrevem o original (110.527 consultas, 62.299 pacientes, 81 bairros, 22.319 faltas) saem de
`python scripts/perfil_dataset.py dados/original/KaggleV2-May-2016.csv`.

## Etapas feitas nesta entrega

O passo a passo completo, com o porquê de cada decisão, está em [docs/processo.md](docs/processo.md).

### 1. Limpeza: [notebooks/01_limpeza.ipynb](notebooks/01_limpeza.ipynb)

O notebook tem 9 passos. Cada um traz o problema, a decisão, a justificativa, o antes e depois e uma checagem
automática (`assert`).

| Passo | Problema | Decisão | Linhas afetadas |
|---|---|---|---|
| 1. Nomes das colunas | Grafia errada (`Hipertension`, `Handcap`), hífen (`No-show`), inglês e estilos misturados | Renomear as 14 colunas para português, em minúsculas e com `_` | 0 (14 colunas renomeadas) |
| 2. Datas | Datas em texto, com hora e fuso (`Z`); a consulta nunca tem horário | Converter para data `AAAA-MM-DD`, sem converter o fuso | 0 (2 colunas convertidas) |
| 3. Idade negativa | 1 consulta com idade -1 | Remover | **1 removida** |
| 4. Consulta antes do agendamento | 5 consultas com data anterior ao agendamento (de -6 a -1 dia) | Remover | **5 removidas** |
| 5. Idade 0 e acima de 100 | 3.539 consultas com idade 0 e 7 com idade acima de 100 (115 anos x5, 102 anos x2) | Manter: são raras, mas possíveis | 0 (nenhuma removida) |
| 6. Coluna `deficiencia` | Vai de 0 a 4, e a fonte não explica o que 2, 3 e 4 significam | Manter de 0 a 4 e criar `tem_deficiencia` (0 ou 1) no passo 8 | 0 (nenhuma removida) |
| 7. `faltou` | `No-show` tem `Yes`/`No`, e o "No" duplo confunde | Criar `faltou`: 1 = faltou, 0 = compareceu | 0 (1 coluna convertida) |
| 8. Colunas derivadas | Faltam grupos prontos para a análise | Criar `dias_espera`, `dia_semana`, `faixa_etaria`, `faixa_espera` e `tem_deficiencia` | 0 (5 colunas criadas) |
| 9. Conferência final e gravação | Garantir que a base está certa e o original intocado | Rodar as checagens, gravar o CSV, reler e conferir o hash do original | 0 |

**Resumo do que entrou e do que saiu:**

| Item | Consultas | Faltas |
|---|---|---|
| Consultas no original | 110.527 | 22.319 |
| Removidas no passo 3: idade negativa (-1) | -1 | 0 |
| Removidas no passo 4: consulta antes do agendamento | -5 | -5 |
| **Consultas na base tratada** | **110.521** | **22.314** |

São **6 linhas removidas** (110.527 para 110.521) e 14 colunas viraram 19. As 5 consultas do passo 4 eram todas faltas,
por isso as faltas caem de 22.319 para 22.314, e a taxa de falta continua em 20,2%.

### 2. Primeira análise: [notebooks/02_exploracao.ipynb](notebooks/02_exploracao.ipynb)

O notebook lê só a base tratada e responde a pergunta central em 8 seções. Os achados (todos descritivos, são
hipóteses a validar, não provas de causa):

1. **A espera é o fator mais associado à falta.** Quem marca para o mesmo dia falta em **4,6%** das consultas; quem
   marca com antecedência, em **28,5%**. A partir de 16 dias a taxa passa de **32%** (32,5% e 33,0%) e praticamente
   para de crescer. Os dias de espera também têm a maior correlação com a falta (0,19), ainda que fraca.
2. **O SMS parece aumentar a falta, mas é correlação espúria.** Na comparação crua, quem recebeu SMS falta mais (**27,6%** com SMS
   contra **16,7%** sem). Mas nenhuma consulta do mesmo dia recebeu SMS, e dentro de cada faixa de espera a taxa com SMS
   é menor (por exemplo, 28,4% contra 34,1% em 8 a 15 dias, e 30,2% contra 37,5% em 31 dias ou mais). Isso é uma
   **associação**, não prova que o SMS reduz a falta; mostra que a comparação crua estava contaminada pela espera.
3. **Adolescentes e jovens faltam mais; quem tem 60+ falta menos.** 13 a 17 anos: **26,6%**; 18 a 29: **24,6%**; 60
   anos ou mais: **15,3%** (taxa geral: 20,2%).
4. **O dia da semana quase não importa.** De segunda a sexta a taxa fica entre **19,3%** e **21,2%**. O sábado (39
   consultas) é amostra pequena demais para concluir.
5. **Alguns bairros se destacam, com cautela.** Entre os 54 bairros com 500 consultas ou mais, **SANTOS DUMONT** tem a
   maior taxa (**28,9%**). É uma pista para o dashboard, não uma conclusão.

## As entregas ao professor e este repositório

O projeto final usa **o mesmo material** das entregas já feitas: a mesma fonte, o mesmo arquivo original, a mesma
limpeza, as mesmas definições e os mesmos números. Nada aqui contradiz um envio anterior.

| Entrega | O que foi enviado | Onde está neste repositório |
|---|---|---|
| **Proposta do tema** (2026-11-03, aprovada) | Tema, problema, fatores a analisar (espera, idade, dia da semana e lembrete), entregáveis e o dataset | [O problema](#o-problema), seções 2 a 5 do [notebook 02](notebooks/02_exploracao.ipynb) e seção **S** do [processo](docs/processo.md) |
| **Entrega 2: Dados** (2026-11-10) | Fonte, autor e licença, descrição da base, dicionário das 14 colunas e os 7 pontos a tratar na limpeza | [Fonte dos dados](#fonte-dos-dados) e os 9 passos do [notebook 01](notebooks/01_limpeza.ipynb), que tratam os 7 pontos um a um |
| **Entrega 3: dados tratados, limpeza e primeira análise** (2026-11-18) | O link deste repositório e o resumo da etapa | `dados/original/`, `dados/tratados/`, os dois notebooks e o [processo](docs/processo.md) |
| **Projeto final** (próxima etapa) | Dashboard (página web) e apresentação executiva | Vão partir da mesma base tratada, com as mesmas faixas e definições. O que já está decidido: [Projeto final](docs/processo.md#projeto-final-o-que-está-decidido) |

A conferência ponto a ponto (o que cada entrega disse e onde isso foi cumprido) está na seção
[Coerência com as entregas ao professor](docs/processo.md#coerência-com-as-entregas-ao-professor) do processo.

## Estrutura das pastas e como rodar

```
.
├── README.md
├── requirements.txt
├── dados/
│   ├── original/KaggleV2-May-2016.csv     # a base do Kaggle, intocada
│   └── tratados/consultas_tratadas.csv    # base tratada: 110.521 linhas, 19 colunas
├── notebooks/
│   ├── 01_limpeza.ipynb                   # limpeza (lê o original, grava a base tratada)
│   └── 02_exploracao.ipynb                # primeira análise (lê só a base tratada)
├── docs/
│   ├── processo.md                        # o como e o porquê de cada etapa (método D.E.I.L.A.S)
│   ├── guia-de-estudo.md                  # resumo para a equipe estudar e o conteúdo dos slides
│   └── plano-projeto-final.md             # o que falta fazer, tarefa a tarefa
└── scripts/
    └── perfil_dataset.py                  # conferência inicial do dataset original
```

**Para rodar** (os notebooks foram executados com Python 3.12 e pandas 3.0):

1. `pip install -r requirements.txt`
2. Abrir o Jupyter e executar, em ordem e do começo ao fim, `notebooks/01_limpeza.ipynb` e depois
   `notebooks/02_exploracao.ipynb`. Os notebooks usam caminhos relativos à pasta `notebooks/`.

**Nota técnica ao abrir a base tratada no Power BI ou no Excel:** importe `paciente_id` como **texto**. Ele é só um
identificador, e 5 IDs vêm escritos como `NNNNE-5` no original (por exemplo `9377952927E-5`) e foram mantidos assim.
Importados como número, o programa pode alterá-los.

## Próximos passos

Decididos em 2026-11-23. O detalhe e o roteiro da apresentação estão na seção
[Projeto final: o que está decidido](docs/processo.md#projeto-final-o-que-está-decidido) do processo. O
[guia de estudo](docs/guia-de-estudo.md) resume o projeto para a equipe e traz o conteúdo de cada slide, as decisões com
o porquê e as perguntas que o professor pode fazer. O [plano](docs/plano-projeto-final.md) lista o que falta, tarefa a
tarefa.

- **Notebook 03**, cruzando espera e idade para medir o grupo de maior risco.
- **Dashboard em uma página web** (Next.js/React, publicada no GitHub Pages), sobre a mesma base tratada
  (`consultas_tratadas.csv`), com a taxa de falta e filtros por idade, dia da semana, bairro e dias de espera, usando
  as mesmas faixas e definições dos notebooks. O Python calcula os números e a página só mostra. A proposta dizia
  Power BI; o professor confirmou que ele é opcional, e o enunciado aceita ferramenta de escolha.
- **Apresentação executiva** de 5 a 10 minutos (o professor reduziu; eram 10 a 15): slides pelo D.E.I.L.A.S, um por letra,
  e, depois, o dashboard, com duas recomendações: lembrete reforçado para o grupo de maior risco e overbooking
  controlado pelo tempo de espera.
