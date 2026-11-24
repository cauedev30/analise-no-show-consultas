# Guia de estudo e conteúdo dos slides

**Projeto:** redução de faltas em consultas (no-show) em clínicas · **Equipe:** Cauê Franco, Lucio Lima e Daniel Vieira
· **Disciplina:** Análise de Dados e BI, professor Daniel Brandão.

Este guia é para a equipe. Ele serve para duas coisas:

1. **Entender o projeto inteiro** sem precisar ler o código: por que escolhemos o tema, de onde vieram os dados, como
   limpamos, o que a análise mostrou e o que recomendamos.
2. **Montar os slides.** A seção [Os slides, letra por letra](#os-slides-letra-por-letra) traz, para cada slide, o que
   escrever, o que falar e onde está o detalhe.

O detalhe completo, com o porquê de cada decisão, está no [processo](processo.md). Este guia é o resumo dele. **Os
números daqui são os mesmos de lá**; se um deles mudar, muda nos dois.

Situação em 2026-11-23: a limpeza e a primeira análise estão prontas (notebooks 01 e 02). Faltam o notebook 03, o
dashboard e os slides. Onde este guia depender de algo que ainda não existe, está escrito **"a fazer"**.

---

## O projeto em um minuto

Clínicas perdem atendimentos porque o paciente marca a consulta e não aparece, sem avisar (o **no-show**). Pegamos uma
base pública com 110.527 consultas, limpamos, analisamos e descobrimos que **cerca de 1 em cada 5 agendados falta
(20,2%)** e que o **tempo de espera** entre marcar e ser atendido é o fator mais ligado à falta: quem marca para o mesmo
dia falta em 4,6% das vezes; quem marca com antecedência, em 28,5%. Com isso, recomendamos duas ações: **lembrete
reforçado** para o grupo que mais falta e **overbooking controlado** nas consultas marcadas com muita antecedência. Um
dashboard mostra esses números com filtros.

Todo o projeto segue o método **D.E.I.L.A.S**, da aula:

| Letra | Significa | No nosso projeto |
|---|---|---|
| **D** | Defina o objetivo | Reduzir as faltas: quem tem mais chance de faltar e o que a clínica pode fazer |
| **E** | Estabeleça métricas | Taxa de falta (faltas ÷ consultas) e espera em dias |
| **I** | Identifique fontes | A base *Medical Appointment No Shows*, do Kaggle. É a única fonte |
| **L** | Limpe as bases | 9 passos, de 110.527 para 110.521 consultas |
| **A** | Analise os dados | A espera é o fator mais associado à falta; o SMS é um caso de correlação espúria |
| **S** | Sugira decisões | Lembrete reforçado para o grupo de maior risco e overbooking controlado pelo tempo de espera |

---

## Os números oficiais

Use sempre estes, com esta escrita. Eles saem dos notebooks, não de memória.

| Número | Valor | De onde sai |
|---|---|---|
| Consultas no arquivo original | **110.527** (14 colunas, 62.299 pacientes, 81 bairros) | `scripts/perfil_dataset.py` |
| Consultas na base tratada | **110.521** (19 colunas) | notebook 01, Passo 9 |
| Linhas removidas na limpeza | **6** (1 com idade -1 e 5 com consulta antes do agendamento) | notebook 01, Passos 3 e 4 |
| Faltas no original / na base tratada | 22.319 / **22.314** | notebook 01 |
| Taxa de falta | **20,2%** (no original e na base tratada) | notebook 02, Seção 1 |
| Mesmo dia x com antecedência | **4,6%** x **28,5%** | notebook 02, Seção 2 |
| Por faixa de espera | Mesmo dia 4,6% · 1-7 dias 24,1% · 8-15 dias 30,8% · 16-30 dias 32,5% · 31+ dias 33,0% | notebook 02, Seção 2 |
| Com SMS x sem SMS (comparação crua) | **27,6%** x **16,7%** | notebook 02, Seção 3 |
| Por idade | 13-17 anos **26,6%** · 18-29 anos 24,6% · 0-12 anos 20,5% · 60+ **15,3%** | notebook 02, Seção 4 |
| Por dia da semana | de 19,3% a 21,2%, de segunda a sexta | notebook 02, Seção 5 |
| Bairro com maior taxa (entre os 54 com 500 consultas ou mais) | SANTOS DUMONT, 28,9% | notebook 02, Seção 6 |
| Grupo de maior risco (16 dias ou mais de espera e 13 a 29 anos) | **a fazer**: sai do notebook 03 | notebook 03 |

Um detalhe que costuma confundir: o subtítulo do Kaggle diz "30%" de falta. O número real, medido nos dados, é **20,2%**.

---

## O que foi decidido em 2026-11-23, e por quê

| Decisão | O que foi considerado | Por quê |
|---|---|---|
| **O dashboard é uma página web** (Next.js/React), publicada no GitHub Pages | Power BI (como estava na proposta), Streamlit e Dash (em Python) e a página web | O professor confirmou que o Power BI é opcional, e o enunciado aceita "ferramenta de escolha". A página abre por um link, sem instalar nada, e dá mais controle do visual, que a rubrica avalia ("visualmente intuitivo") |
| **O Python calcula, a página mostra** | Fazer as contas na própria página ou calcular tudo em Python | A disciplina é de análise de dados em Python. Um script Python lê a base tratada e grava os números em um arquivo; a página só exibe. Assim os números do dashboard são os mesmos dos notebooks |
| **Não construímos uma aplicação** | Construir uma calculadora de risco de falta ou só propor | O enunciado pede diagnosticar o problema e **propor** soluções com base nos dados. A calculadora entra como ideia, dentro do **S** |
| **A documentação fica só neste repositório** | Um documento à parte (docx/PDF) ou o repositório | Um lugar só evita versões diferentes do mesmo número. O README é a porta de entrada, o [processo](processo.md) é o detalhe e este guia é o resumo para estudar |
| **A apresentação usa só dois materiais: os slides e o dashboard** | Abrir também o repositório e os notebooks durante a fala | São 5 a 10 minutos. Os slides explicam o caminho e o dashboard mostra o resultado |
| **Os slides seguem o D.E.I.L.A.S, um slide por letra** | Slides separados para "de onde vieram os dados" e "como limpamos" | Essas duas partes já são o **I** e o **L**. Falando do D.E.I.L.A.S, cobrimos tudo o que o professor pediu, na ordem que ele ensinou |
| **A apresentação tem 5 a 10 minutos** | O enunciado e a proposta diziam 10 a 15 | O professor reduziu o tempo |
| **A ordem do dashboard fica em aberto** | Mostrar o dashboard depois de todos os slides, ou entre o **A** e o **S** | Os slides e o dashboard são independentes, então dá para decidir no ensaio. Entre o A e o S, a apresentação fecha no slide das recomendações |

O que mudou em relação ao que já foi enviado ao professor (Power BI e tempo da apresentação) também está registrado em
["O que mudou"](processo.md#o-que-mudou-de-uma-entrega-para-a-outra-e-por-quê), no processo.

---

## Os slides, letra por letra

São **7 slides**: a capa e um por letra. Pouco texto e um número grande em cada um. Para cada slide, este guia traz o
que vai **no slide**, o que **falar** e onde está o **detalhe**.

O enunciado pede que a apresentação explique o dataset, as regras de negócio, o processo de ideação, a definição do
problema, a relevância e o resultado final. Está tudo coberto: o dataset no **I**; as regras de negócio no **E** e no
**L**; a ideação, o problema e a relevância no **D**; o resultado final no **A**, no **S** e no dashboard.

### Slide 1: Capa

- **No slide:** "Redução de faltas em consultas (no-show) em clínicas"; Cauê Franco, Lucio Lima e Daniel Vieira;
  Análise de Dados e BI, professor Daniel Brandão.

### Slide 2: D, Defina o objetivo

- **Número grande:** **20,2%** (cerca de 1 em cada 5 agendados falta).
- **No slide:**
  - No-show: o paciente marca a consulta e não comparece, sem avisar.
  - A dor: a clínica perde capacidade de atendimento. O horário vago não é reaproveitado e quem estava na fila fica sem
    vaga.
  - A pergunta: **quem tem mais chance de faltar e o que a clínica pode fazer para reduzir isso?**
- **O que falar:**
  - **Por que a falta dói numa clínica privada.** Em geral o paciente marca antes e só paga na hora (ou o convênio só
    paga a consulta realizada). Quem falta não paga, e a vaga que ele segurou poderia ter sido de outro paciente
    pagante. Como a falta é sem aviso, não dá tempo de chamar ninguém para o lugar. Não calculamos esse valor em
    reais porque a base não traz o preço da consulta.
  - **Por que este tema (a ideação).** O problema é comum, fácil de explicar e tem uma base pública boa, em uma tabela
    só. Consideramos outros dois temas e descartamos: Logística/Vendas (a base tem muitas tabelas para juntar) e Ensino
    Superior, com evasão (muitas variáveis acadêmicas).
  - **O setor.** Escolhemos Saúde Privada. A base indica consultas da rede pública (tem a coluna de Bolsa Família e
    bairros de Vitória, ES). Não existe base pública equivalente de clínicas privadas, então usamos esta como
    **aproximação**. A premissa é que os fatores ligados à falta, principalmente a espera, também valem numa clínica
    privada.
- **Detalhe:** [seção D do processo](processo.md#d-defina-o-objetivo).

### Slide 3: E, Estabeleça métricas

- **Número grande:** **taxa de falta = faltas ÷ consultas** (22.314 ÷ 110.521 = 20,2%).
- **No slide:**
  - **Taxa de falta:** consultas em que o paciente faltou, divididas pelo total de consultas, em %.
  - **Espera:** dias de calendário entre o dia do agendamento e o dia da consulta.
  - As faixas de idade: 0-12, 13-17, 18-29, 30-44, 45-59 e 60+.
  - As faixas de espera: Mesmo dia, 1-7 dias, 8-15 dias, 16-30 dias e 31+ dias.
- **O que falar:**
  - Estas são as **regras de negócio** do projeto. Elas valem iguais no código, no dashboard e nos slides.
  - A espera é contada em dias porque a base só traz a **data** da consulta, sem o horário.
  - "Mesmo dia" é uma faixa à parte porque marcar e ir no mesmo dia é uma situação diferente das outras.
  - As faixas foram fechadas **antes** da análise, para não escolher os cortes olhando o resultado.
- **Detalhe:** [seção E do processo](processo.md#e-estabeleça-métricas).

### Slide 4: I, Identifique fontes

- **Número grande:** **110.527 consultas**.
- **No slide:**
  - Base *Medical Appointment No Shows*, do Kaggle. Autor: Joni Hoppen (Aquarela Analytics). Licença CC BY-NC-SA 4.0.
  - 14 colunas, 62.299 pacientes, 81 bairros de Vitória (ES).
  - Consultas de 29/04/2016 a 08/06/2016.
  - É a **única fonte** de dados do projeto.
- **O que falar:**
  - **Como obtivemos:** baixamos o arquivo do Kaggle em 2026-11-10 e guardamos em `dados/original/` sem nenhuma
    alteração. Não houve coleta própria nem junção com outra base.
  - **O original nunca é alterado.** A limpeza lê o original e grava o resultado em outro arquivo. Para provar, o
    notebook confere a "impressão digital" do arquivo (o hash) antes e depois da limpeza, e as duas são iguais.
  - **O que cada linha é:** uma consulta agendada, com a idade e o sexo do paciente, o bairro, o dia em que marcou, o
    dia da consulta, se recebeu SMS, algumas condições de saúde e se faltou ou não.
  - A base não tem valores vazios nem linhas repetidas. Os problemas estão escondidos nos valores e nos nomes, e é isso
    que a limpeza trata.
- **Detalhe:** [seção I do processo](processo.md#i-identifique-fontes).

### Slide 5: L, Limpe as bases

- **Número grande:** **110.527 → 110.521** (6 linhas removidas).
- **No slide:**
  - **Removemos o que é impossível:** 1 consulta com idade -1 e 5 consultas com data anterior ao agendamento.
  - **Mantivemos o que é raro, mas possível:** idade 0 (bebês) e idade acima de 100.
  - **Corrigimos e padronizamos:** nomes das colunas e datas.
  - **Criamos:** a coluna `faltou` (1 = faltou, 0 = compareceu) e as faixas de idade e de espera.
- **O que falar:**
  - A limpeza tem **9 passos** no notebook 01. Cada passo traz o problema, a decisão, a justificativa e uma checagem
    automática.
  - **Por que remover só 6 linhas.** Só saiu o que é impossível e não tem conserto: não dá para saber a idade
    verdadeira de quem está com -1, nem qual das duas datas está errada. Inventar um valor seria inventar dado.
  - **Por que a idade 0 ficou.** São 3.539 consultas de bebês com menos de 1 ano. É possível, então fica.
  - **Por que a idade acima de 100 ficou.** São 7 consultas. É raro, mas possível, e não há prova de erro.
  - **A taxa de falta não mudou.** As 5 consultas removidas por data eram todas faltas (22.319 → 22.314), mas 5 linhas
    em mais de 110 mil não mexem na proporção: continua 20,2%.
  - Feito em Python, com Pandas, em notebook Jupyter.
- **Detalhe:** [seção L do processo](processo.md#l-limpe-as-bases), com os 9 passos, e o
  [notebook 01](../notebooks/01_limpeza.ipynb).

Os 9 passos, em uma linha cada:

| Passo | O que foi feito | Linhas removidas |
|---|---|---|
| 1 | As 14 colunas renomeadas para português, sem erro de grafia e sem hífen | 0 |
| 2 | As duas datas convertidas de texto para data | 0 |
| 3 | Idade -1 removida | 1 |
| 4 | Consultas com data anterior ao agendamento removidas | 5 |
| 5 | Idade 0 e idade acima de 100 mantidas | 0 |
| 6 | Coluna de deficiência (0 a 4) mantida como veio, com a dúvida registrada | 0 |
| 7 | Criada a coluna `faltou` (0 ou 1) | 0 |
| 8 | Criadas as colunas de espera, dia da semana e faixas (14 → 19 colunas) | 0 |
| 9 | Conferência final e gravação da base tratada | 0 |

### Slide 6: A, Analise os dados

- **Número grande:** **4,6% x 28,5%** (mesmo dia x com antecedência).
- **No slide:**
  - **A espera é o fator mais associado à falta.** Quem marca para o mesmo dia quase não falta; a partir de 16 dias de
    espera, a taxa passa de 32%.
  - **O SMS e a correlação espúria.** Quem recebeu SMS falta mais (27,6% x 16,7%), mas a causa aparente é a espera.
  - **A idade.** Adolescentes de 13 a 17 anos faltam mais (26,6%); quem tem 60 anos ou mais falta menos (15,3%).
- **O que falar:**
  - **A espera.** Mesmo dia: 4,6%. Com antecedência: 28,5%, cerca de 6 vezes mais. A taxa sobe até a faixa de 16 a 30
    dias e depois quase para de crescer.
  - **O SMS, passo a passo.** (1) Na comparação crua, o SMS parece **aumentar** a falta. (2) O fator escondido é a
    espera: nenhuma consulta do mesmo dia recebeu SMS, porque o SMS só aparece a partir de 3 dias de espera. O grupo
    "sem SMS" fica cheio de consultas do mesmo dia, que quase não faltam, e isso puxa a taxa dele para baixo. (3)
    Comparando dentro de cada faixa de espera, quem recebeu SMS falta igual ou menos. Isso é uma **correlação
    espúria**: duas coisas andam juntas nos números, mas por causa de um terceiro fator.
  - **O que não pesa.** O dia da semana quase não importa (de 19,3% a 21,2%, de segunda a sexta).
  - **O limite.** A análise é descritiva. Ela mostra associação, e **não prova causa**.
  - **Como os números chegam ao dashboard.** Base tratada → script Python → página. É a deixa para abrir o dashboard.
- **Detalhe:** [seção A do processo](processo.md#a-analise-os-dados) e o
  [notebook 02](../notebooks/02_exploracao.ipynb).

### Slide 7: S, Sugira decisões

- **Número grande:** a taxa de falta do grupo de maior risco (**a fazer**: sai do notebook 03).
- **No slide:**
  - **Recomendação 1: lembrete reforçado para o grupo de maior risco.** O grupo combina espera longa (16 dias ou mais)
    e idade de 13 a 29 anos. Reforçar quer dizer, por exemplo, mais de um contato antes da consulta.
  - **Recomendação 2: overbooking controlado pelo tempo de espera.** Marcar um pouco acima da capacidade nas consultas
    agendadas com muita antecedência, que são as que mais faltam, para reaproveitar os horários vagos.
  - **Ideia de aplicação:** uma calculadora de risco de falta para a recepção.
- **O que falar:**
  - As duas recomendações saem dos dados: a espera é o fator mais associado à falta, e adolescentes e jovens faltam
    mais que a média.
  - **Por que o overbooking é pela espera, e não pelo horário.** A base não tem o horário da consulta, só a data.
  - **A calculadora é uma ideia, não foi construída.** A recepção informaria a idade e os dias de espera e veria a taxa
    de falta do grupo e a ação recomendada.
  - **Os limites.** Os dados são da rede pública e entram como aproximação; a clínica deve conferir com os próprios
    dados antes de aplicar. O limite do overbooking precisa de cuidado para não gerar fila.
- **Detalhe:** [seção S do processo](processo.md#s-sugira-decisões).

---

## O dashboard

**Situação:** a fazer. O link entra aqui e no README quando ele for publicado.

**Como funciona, em uma frase:** um script Python lê a base tratada e grava os números em um arquivo; a página web lê
esse arquivo e mostra. A única conta que a página faz é a dos filtros (somar as consultas e as faltas do recorte
escolhido e dividir), pela mesma definição do slide **E**.

| Aba | O que tem | Para mostrar na apresentação |
|---|---|---|
| **Visão geral** | 4 filtros (faixa de idade, dia da semana, bairro e faixa de espera); 3 cartões (consultas, faltas e taxa de falta); taxa de falta por faixa de espera, por faixa de idade e por dia da semana; bairros com maior taxa | Os cartões sem filtro (110.521, 22.314 e 20,2%); o gráfico da espera; um filtro ao vivo |
| **Grupo de risco e SMS** | A taxa de falta cruzando idade e espera; os números do grupo de maior risco; a taxa com e sem SMS em cada faixa de espera; o bloco das recomendações | O cruzamento idade x espera; o SMS dentro de cada faixa de espera; as recomendações |

No ranking de bairros só entram os que têm 500 consultas ou mais, porque com poucas consultas a taxa é puro acaso (um
bairro com 2 consultas aparece com 100% de falta).

---

## Perguntas que o professor pode fazer

| Pergunta | Resposta |
|---|---|
| Por que removeram só 6 linhas? | Só removemos o que é impossível e não tem conserto: 1 idade negativa e 5 consultas antes do agendamento. O resto é raro, mas possível, e ficou |
| Idade 0 e idade 115 não são erros? | Idade 0 são bebês com menos de 1 ano (3.539 consultas). Acima de 100 são 7 consultas: raro, mas possível, e sem prova de erro. Não mudam as taxas |
| O Kaggle diz 30% de falta. Por que 20,2%? | 30% é o subtítulo da página. Medindo nos dados, são 22.319 faltas em 110.527 consultas: 20,2% |
| Então o SMS aumenta a falta? | Não. É uma correlação espúria: o SMS só é enviado para quem espera 3 dias ou mais, e quem espera mais falta mais. Dentro da mesma faixa de espera, quem recebeu SMS falta igual ou menos |
| Então o SMS reduz a falta? | Os dados mostram a associação, mas não provam. Quem recebe SMS não foi sorteado. Para afirmar, seria preciso um teste controlado |
| A espera causa a falta? | A análise é descritiva: mostra que a espera é o fator mais associado à falta, não que ela é a causa |
| O setor é Saúde Privada, mas os dados são da rede pública? | Sim. Não há base pública de clínicas privadas. Usamos esta como aproximação e declaramos a premissa. A clínica deve conferir com os próprios dados |
| Se o paciente paga a consulta, qual é o prejuízo da clínica? | Em geral ele marca antes e só paga na hora, e o convênio só paga a consulta realizada. Quem falta não paga, e a vaga que ficou presa poderia ter sido de outro paciente pagante. Sem aviso, não dá tempo de encaixar ninguém |
| Quanto a clínica perde em dinheiro? | Não calculamos. A base não tem o valor da consulta, e ela é a única fonte do projeto. Medimos a perda em consultas: 22.314 faltas em 110.521 |
| Como garantem que o arquivo original não foi alterado? | O notebook confere o hash (a impressão digital) do arquivo antes e depois da limpeza, e é o mesmo do arquivo baixado do Kaggle |
| Por que o dashboard não é em Power BI? | O enunciado aceita ferramenta de escolha. A página abre por um link, sem instalar nada, e os números continuam saindo do Python, da mesma base tratada |
| Onde está o Python no dashboard? | No script que lê a base tratada e gera os números que a página mostra |
| Por que não fizeram um modelo de previsão ou uma aplicação? | O enunciado pede diagnosticar e propor soluções com base nos dados. A calculadora de risco entra como ideia de aplicação |
| Por que o overbooking é pela espera? | A base só tem a data da consulta, sem o horário. E a espera é o fator mais associado à falta |

---

## Palavras que aparecem no projeto

| Palavra | O que quer dizer |
|---|---|
| **No-show** | O paciente marca a consulta e não comparece, sem avisar |
| **Taxa de falta** | Faltas ÷ consultas, em % |
| **Espera** | Dias de calendário entre o agendamento e a consulta |
| **Base tratada** | O arquivo depois da limpeza (`dados/tratados/consultas_tratadas.csv`). É a única base da análise e do dashboard |
| **Correlação espúria** | Duas coisas andam juntas nos números, mas a relação aparente vem de um terceiro fator escondido |
| **Overbooking** | Marcar um pouco mais de consultas do que a capacidade, contando que parte dos pacientes vai faltar |
| **KPI** | Indicador principal. No dashboard: consultas, faltas e taxa de falta |
| **Hash** | A impressão digital de um arquivo. Se um único caractere mudar, o hash muda |

---

## O que falta fazer, em ordem

| # | Etapa | O que entrega |
|---|---|---|
| 1 | Notebook 03 | O cruzamento de espera e idade, com o tamanho e a taxa do grupo de maior risco (o número do slide **S**) |
| 2 | Dados do dashboard | O script Python que lê a base tratada e grava os números, com um teste que confere os números oficiais |
| 3 | Dashboard | A página web com as duas abas, publicada no GitHub Pages |
| 4 | Documentação | README, processo e este guia atualizados com o notebook 03 e o link do dashboard |
| 5 | Conferência final | Os números iguais no README, no processo, neste guia, no dashboard e nos slides |

Os slides podem começar já: os slides 1 a 6 só usam números que já estão prontos. O slide 7 (**S**) depende do número
do notebook 03.
