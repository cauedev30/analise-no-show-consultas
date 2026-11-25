# Guia de estudo e conteúdo dos slides

**Projeto:** redução de faltas em consultas (no-show) em clínicas · **Equipe:** Cauê Franco, Lucio Lima e Daniel Vieira
· **Disciplina:** Análise de Dados e BI, professor Daniel Brandão.

Este guia é para a equipe. Ele serve para duas coisas:

1. **Entender o projeto inteiro** sem precisar ler o código: por que escolhemos o tema, de onde vieram os dados, como
   limpamos, o que a análise mostrou e o que recomendamos.
2. **Montar e apresentar os slides.** A seção [Os slides, letra por letra](#os-slides-letra-por-letra) traz, para cada
   slide, o que escrever, o que falar e onde está o detalhe. A seção [O dashboard](#o-dashboard) traz o passo a passo da
   demonstração.

O detalhe completo, com o porquê de cada decisão, está no [processo](processo.md). Este guia é o resumo dele. **Os
números daqui são os mesmos de lá**; se um deles mudar, muda nos dois.

Situação em 2026-11-24: os três notebooks (01, 02 e 03), o script e o dashboard estão prontos, o dashboard está
publicado em **<https://cauedev30.github.io/analise-no-show-consultas/>** e **a apresentação foi feita**. A seção dos
slides abaixo traz a versão final, a que foi apresentada. Falta só o envio do link ao professor (veja
[O que falta fazer](#o-que-falta-fazer)).

---

## O projeto em um minuto

Clínicas perdem atendimentos porque o paciente marca a consulta e não aparece, sem avisar (o **no-show**). Pegamos uma
base pública com 110.527 consultas, limpamos, analisamos e descobrimos que **cerca de 1 em cada 5 agendados falta
(20,2%)** e que o **tempo de espera** entre marcar e ser atendido é o fator mais ligado à falta: quem marca para o mesmo
dia falta em 4,6% das vezes; quem marca com antecedência, em 28,5%. Cruzando a espera com a idade, achamos o **grupo de
maior risco** (13 a 29 anos com 16 dias ou mais de espera): ele é só 4,9% das consultas e falta em 40,2%, o dobro da
média. Com isso, recomendamos **uma solução**: um **agente de disparo de lembretes**, que classifica o risco no
agendamento, manda mais lembretes a quem tem risco alto e oferece o horário a quem está na lista de espera quando o
paciente cancela ou não confirma. Um dashboard mostra os números com filtros.

Todo o projeto segue o método **D.E.I.L.A.S**, da aula:

| Letra | Significa | No nosso projeto |
|---|---|---|
| **D** | Defina o objetivo | Reduzir as faltas: quem tem mais chance de faltar e o que a clínica pode fazer |
| **E** | Estabeleça métricas | Taxa de falta (faltas ÷ consultas) e espera em dias |
| **I** | Identifique fontes | A base *Medical Appointment No Shows*, do Kaggle. É a única fonte |
| **L** | Limpe as bases | 9 passos, de 110.527 para 110.521 consultas |
| **A** | Analise os dados | A espera é o fator mais associado à falta; o disparo de lembrete é um caso de correlação espúria; o grupo de maior risco |
| **S** | Sugira decisões | Um agente de disparo de lembretes: Classifica, Dispara, Libera |

### Os quatro pontos da proposta

A proposta aprovada pelo professor resumia o projeto em quatro pontos. Eles aparecem no roteiro: o problema e o objetivo
no **D** e no **S**, o dataset no **I** e a ferramenta no **L** e no **A**.

| Ponto | Como ficou |
|---|---|
| **Problema** | Cerca de 1 em cada 5 pacientes agendados falta à consulta (20,2%). O horário vago não é reaproveitado e quem está na fila fica sem vaga |
| **Dataset** | *Medical Appointment No Shows* (Kaggle): 110.527 consultas, 14 colunas, única fonte do projeto |
| **Ferramenta** | Python (Pandas, Matplotlib, Seaborn) em notebooks Jupyter para a limpeza, a análise e os números do dashboard; uma página web (Next.js/React) para exibir o dashboard; GitHub para o código, a documentação e a publicação |
| **Objetivo da solução** | Mostrar quem tem mais chance de faltar e recomendar uma ação: um agente de disparo de lembretes, que dá atenção extra ao grupo de maior risco |

---

## Os números oficiais

Use sempre estes, com esta escrita. Eles saem dos notebooks e do script, não de memória.

| Número | Valor | De onde sai |
|---|---|---|
| Consultas no arquivo original | **110.527** (14 colunas, 62.299 pacientes, 81 bairros) | `scripts/perfil_dataset.py` |
| Consultas na base tratada | **110.521** (19 colunas) | notebook 01, Passo 9 |
| Linhas removidas na limpeza | **6** (1 com idade -1 e 5 com consulta antes do agendamento) | notebook 01, Passos 3 e 4 |
| Idade 0 / idade acima de 100 (ficam) | 3.539 consultas / 7 consultas | notebook 01, Passo 5 |
| Esperas acima do limite do IQR (ficam) | **5.803** consultas acima de 37 dias (limite 37,5 = 15 + 1,5 × 15), até 179 dias, com 32,0% de falta | notebook 01, Passo 5 |
| Faltas no original / na base tratada | 22.319 / **22.314** | notebook 01 |
| Taxa de falta | **20,2%** (no original e na base tratada) | notebook 02, Seção 1 |
| Mesmo dia x com antecedência | **4,6%** (1.792 de 38.562) x **28,5%** (20.522 de 71.959) | notebook 02, Seção 2 |
| Por faixa de espera | Mesmo dia 4,6% · 1-7 dias 24,1% · 8-15 dias 30,8% · 16-30 dias 32,5% · 31+ dias 33,0% | notebook 02, Seção 2 |
| Com disparo (SMS na base) x sem disparo (comparação crua) | **27,6%** (9.784 de 35.482) x **16,7%** (12.530 de 75.039) | notebook 02, Seção 3 |
| Disparo, sem x com, dentro de cada faixa de espera | 1-7 dias 24,4% x 23,8% · 8-15 dias 34,1% x 28,4% · 16-30 dias 36,8% x 29,7% · 31+ dias 37,5% x 30,2%. O disparo só aparece com 3 dias ou mais de espera | notebook 02, Seção 3 |
| Por idade | 13-17 anos **26,6%** · 18-29 anos 24,6% · 0-12 anos 20,5% · 60+ **15,3%** | notebook 02, Seção 4 |
| Por dia da semana | de 19,3% a 21,2%, de segunda a sexta | notebook 02, Seção 5 |
| Bairro com maior taxa (entre os 54 com 500 consultas ou mais) | SANTOS DUMONT, 28,9% (1.276 consultas) | notebook 02, Seção 6 |
| Maior e menor célula do cruzamento idade x espera | **42,5%** (13-17 anos, 31+ dias, 532 consultas) e **3,1%** (60+, mesmo dia, 6.321 consultas) | notebook 03, Seção 1 |
| **Grupo de maior risco** (13 a 29 anos e 16 dias ou mais de espera) | **5.422 consultas** (4,9% das consultas), taxa de falta **40,2%** (o dobro da média), **9,8% das faltas** (2.178 de 22.314) | notebook 03, Seção 2 |
| Espera longa (16 dias ou mais, todas as idades) | 26.246 consultas (23,7%), falta em 32,7%, concentra 38,5% das faltas | notebook 03, Seção 2 |
| **Faltas do grupo acima da média** | 2.178 faltas contra cerca de 1.095 na taxa geral: **1.083** consultas a mais em seis semanas | notebook 03, Seção 3 |

Um detalhe que costuma confundir: o subtítulo do Kaggle diz "30%" de falta. O número real, medido nos dados, é **20,2%**.

---

## O que foi decidido, e por quê

Decisões de 2026-11-23 e 2026-11-24.

| Decisão | O que foi considerado | Por quê |
|---|---|---|
| **O dashboard é uma página web** (Next.js/React), publicada no GitHub Pages | Power BI (como estava na proposta), Streamlit e Dash (em Python) e a página web | O professor confirmou que o Power BI é opcional, e o enunciado aceita "ferramenta de escolha". A página abre por um link, sem instalar nada, e dá mais controle do visual, que a rubrica avalia ("visualmente intuitivo") |
| **O Python calcula, a página mostra** | Fazer as contas na própria página ou calcular tudo em Python | A disciplina é de análise de dados em Python. Um script Python lê a base tratada e grava os números em um arquivo; a página só exibe. Assim os números do dashboard são os mesmos dos notebooks |
| **Uma solução só: o agente de disparo de lembretes** | Duas recomendações (lembrete reforçado e overbooking controlado) ou uma solução só | O grupo preferiu uma solução só. O enunciado não pede um número de soluções, e a proposta citava as ações como exemplos. O agente continua sendo mais de uma ação (classifica, dispara e libera o horário) e já cobre o que o overbooking queria, reaproveitar o horário vago, pela lista de espera |
| **"Disparo de lembrete" no lugar de "SMS"** | Manter "SMS" ou usar um nome do canal | O canal mais usado hoje é o WhatsApp, e é o canal pensado. O nome fica igual do começo ao fim da apresentação. Para não parecer outro dado, a ponte com a base fica dita: **na base, o disparo registrado é o SMS** (coluna `recebeu_sms`) |
| **Não construímos uma aplicação** | Construir uma calculadora de risco de falta ou só propor | O enunciado pede diagnosticar o problema e **propor** soluções com base nos dados. A ideia da calculadora virou o passo **Classifica** do agente |
| **A documentação fica só neste repositório** | Um documento à parte (docx/PDF) ou o repositório | Um lugar só evita versões diferentes do mesmo número. O README é a porta de entrada, o [processo](processo.md) é o detalhe e este guia é o resumo para estudar |
| **A apresentação usa só dois materiais: os slides e o dashboard** | Abrir também o repositório e os notebooks durante a fala | São 5 a 10 minutos. Os slides explicam o caminho e o dashboard mostra o resultado |
| **Os slides seguem o D.E.I.L.A.S, um slide por letra** | Slides separados para "de onde vieram os dados" e "como limpamos" | Essas duas partes já são o **I** e o **L**. Falando do D.E.I.L.A.S, cobrimos tudo o que o professor pediu, na ordem que ele ensinou |
| **A apresentação tem 5 a 10 minutos** | O enunciado e a proposta diziam 10 a 15 | O professor reduziu o tempo |
| **A ordem do dashboard fica para a hora** | Mostrar o dashboard depois de todos os slides, ou entre o **A** e o **S** | Os slides e o dashboard são independentes, então o grupo decide no ensaio. Entre o **A** e o **S**, a apresentação fecha no slide das recomendações |
| **O dia da semana é só um filtro, sem gráfico** | Manter o gráfico de barras por dia da semana | A taxa quase não muda (19,3% a 21,2%), o que cabe numa frase. O filtro fica, porque está na proposta aprovada |

O que mudou em relação ao que já foi enviado ao professor (ferramenta do dashboard, tempo da apresentação, a solução
e o nome "disparo de lembrete") também está registrado em
["O que mudou"](processo.md#o-que-mudou-de-uma-entrega-para-a-outra-e-por-quê), no processo.

---

## Os slides, letra por letra

São **7 slides**: a capa e um por letra. Pouco texto e um número grande em cada um. Para cada slide, este guia traz o
que vai **no slide**, o que **falar** e onde está o **detalhe**.

O enunciado pede que a apresentação explique o dataset, as regras de negócio, o processo de ideação, a definição do
problema, a relevância e o resultado final. Está tudo coberto: o dataset no **I**; as regras de negócio no **E** e no
**L**; a ideação, o problema e a relevância no **D**; o resultado final no **A**, no **S** e no dashboard.

### Slide 1: Capa

- **No slide:** "Redução de faltas em consultas médicas"; "No-show é quando o paciente marca a consulta e não aparece
  nem avisa. Na base que usamos, isso aconteceu em 1 de cada 5 consultas. O horário fica parado, e sem aviso não dá
  tempo de chamar outro paciente."; Cauê Franco, Lucio Lima e Daniel Vieira; Projeto final de Análise de Dados e BI,
  Prof. Daniel Brandão.

### Slide 2: D, Defina o objetivo

- **Título:** "Queremos saber quem falta e o que a clínica pode fazer".
- **Número grande:** **20,2%** das consultas agendadas terminaram em falta (22.314 de 110.521, em cerca de seis
  semanas).
- **No slide:**
  - "Quem falta não paga, e o convênio só paga a consulta realizada. A base não traz o preço, então medimos a perda em
    número de consultas."
  - As cinco **perguntas de negócio**, que o resto da apresentação responde (veja
    [as perguntas P1 a P5](#as-perguntas-de-negócio-p1-a-p5)).
- **O que falar:**
  - **Por que a falta dói numa clínica privada.** Em geral o paciente marca antes e só paga na hora (ou o convênio só
    paga a consulta realizada). Quem falta não paga, e a vaga que ele segurou poderia ter sido de outro paciente
    pagante. Como a falta é sem aviso, não dá tempo de chamar ninguém para o lugar. Não calculamos esse valor em
    reais porque a base não traz o preço da consulta; medimos a perda em número de consultas.
  - **Por que este tema (a ideação).** O problema é comum, fácil de explicar e tem uma base pública boa, em uma tabela
    só. Consideramos outros dois temas e descartamos: Logística/Vendas (a base tem muitas tabelas para juntar) e Ensino
    Superior, com evasão (muitas variáveis acadêmicas).
  - **O setor.** Escolhemos Saúde Privada. A base indica consultas da rede pública (tem a coluna de Bolsa Família e
    bairros de Vitória, ES). Não existe base pública equivalente de clínicas privadas, então usamos esta como
    **aproximação**. A premissa é que os fatores ligados à falta, principalmente a espera, também valem numa clínica
    privada.
- **Detalhe:** [seção D do processo](processo.md#d-defina-o-objetivo).

### As perguntas de negócio (P1 a P5)

Os slides fazem cinco perguntas e respondem uma a uma. Todas as respostas usam só os números oficiais.

| Pergunta | Resposta | Onde aparece |
|---|---|---|
| **P1.** Quantas consultas viram falta? | 22.314 de 110.521, ou **20,2%** | slide **D** |
| **P2.** A espera até a consulta muda a chance de falta? | Sim: 4,6% no mesmo dia, 24,1% com 1 a 7 dias, 30,8% com 8 a 15, 32,5% com 16 a 30 e 33,0% com 31 ou mais | slide **A** |
| **P3.** Que perfil de paciente falta mais? | Adolescentes e jovens (13 a 17 anos: 26,6%; 18 a 29: 24,6%), e mais ainda com espera longa. O **grupo de maior risco** (13 a 29 anos e 16 dias ou mais) falta em **40,2%**, o dobro da média; é 4,9% das consultas e soma 9,8% das faltas | slide **A** |
| **P4.** O disparo de lembrete ajuda? | Na mesma faixa de espera, quem recebe o disparo não falta mais (por exemplo, 28,4% contra 34,1% em 8 a 15 dias). Com todo mundo junto parece o contrário (27,6% com disparo e 16,7% sem), porque o disparo só vai para quem espera 3 dias ou mais. É associação, não prova | slide **A** |
| **P5.** O que a clínica pode fazer para reduzir as faltas? | O agente de disparo de lembretes, que usa a espera (P2), o perfil (P3) e o disparo (P4) | slide **S** |

### Slide 3: E, Estabeleça métricas

- **Título:** "Definimos as regras de cálculo antes de analisar".
- **Número grande:** **taxa de falta = faltas ÷ consultas** (22.314 ÷ 110.521 = 20,2%).
- **No slide:**
  - **Taxa de falta:** consultas em que o paciente faltou, divididas pelo total de consultas, em %.
  - **Espera:** os dias entre marcar e ir à consulta. A base tem a data, mas não a hora.
  - As faixas de idade: 0-12, 13-17, 18-29, 30-44, 45-59 e 60+.
  - As faixas de espera: Mesmo dia, 1-7, 8-15, 16-30 e 31+ dias.
  - "Escolhemos as faixas antes de ver os resultados, para não ajustar os cortes à conclusão. O código e o dashboard
    usam as mesmas."
- **O que falar:**
  - Estas são as **regras de negócio** do projeto. Elas valem iguais no código, no dashboard e nos slides.
  - A espera é contada em dias porque a base só traz a **data** da consulta, sem o horário.
  - "Mesmo dia" é uma faixa à parte porque marcar e ir no mesmo dia é uma situação diferente das outras.
  - As faixas foram fechadas **antes** da análise, para não escolher os cortes olhando o resultado.
- **Detalhe:** [seção E do processo](processo.md#e-estabeleça-métricas).

### Slide 4: I, Identifique fontes

- **Título:** "Uma base pública com 110.527 consultas reais".
- **No slide:**
  - **Fonte:** Kaggle, *Medical Appointment No Shows*, de Joni Hoppen (Aquarela Analytics). **Licença:** CC BY-NC-SA 4.0.
  - **Onde e quando:** Vitória-ES, de 29/04 a 08/06/2016. Tudo indica que é a rede pública.
  - **Tamanho:** 110.527 consultas de 62.299 pacientes, 14 colunas.
  - **Qualidade:** nenhum valor vazio e nenhuma consulta repetida.
  - **Arquivo:** baixado em 10/11/2026 e guardado sem alteração, conferido por SHA-256.
  - **Premissa:** usamos a rede pública como aproximação de uma clínica privada.
  - **Uma linha da base**, como exemplo: paciente de 62 anos, hipertensa, do Jardim da Penha, que marcou e foi atendida
    no mesmo dia (29/04/2016), sem disparo, e não faltou.
- **O que falar:**
  - **Como obtivemos:** baixamos o arquivo do Kaggle em 2026-11-10 e guardamos em `dados/original/` sem nenhuma
    alteração. Não houve coleta própria nem junção com outra base.
  - **O original nunca é alterado.** A limpeza lê o original e grava o resultado em outro arquivo. Para provar, o
    notebook confere a "impressão digital" do arquivo (o hash) antes e depois da limpeza, e as duas são iguais.
  - **O que cada linha é:** uma consulta agendada, com a idade e o sexo do paciente, o bairro, o dia em que marcou, o
    dia da consulta, se recebeu o lembrete (na base, o SMS), algumas condições de saúde e se faltou ou não.
  - A base não tem valores vazios nem linhas repetidas. Os problemas estão escondidos nos valores e nos nomes, e é isso
    que a limpeza trata.
- **Detalhe:** [seção I do processo](processo.md#i-identifique-fontes).

### Slide 5: L, Limpe as bases

- **Título:** "Só removemos as 6 linhas impossíveis".
- **Número grande:** **110.527 → 110.521** (−1 com idade igual a −1; −5 com consulta marcada para antes do
  agendamento). Depois da limpeza, a taxa de falta continua 20,2%.
- **No slide:**
  - **O que mantivemos de propósito:** 3.539 consultas de bebês (idade 0); 7 consultas acima de 100 anos; 5.803 esperas
    acima de 37 dias (limite do IQR), até 179 dias, que são reais e viram falta em 32% das vezes.
  - **5 colunas novas, de 14 para 19:** `dias_espera` (o fator mais ligado à falta); `dia_semana` (alimenta o filtro do
    dashboard, previsto na proposta aprovada); `faixa_etaria` e `faixa_espera` (agrupam idade e espera nas faixas do
    slide **E**, para os gráficos e o grupo de risco); `tem_deficiencia` (resume a `Handcap`, de 0 a 4, em sim ou não).
  - "Também convertemos No-show em `faltou` (0/1), corrigimos nomes como Hipertension e Handcap e passamos as datas de
    texto para data."
- **O que falar:**
  - A limpeza tem **9 passos** no notebook 01. Cada passo traz o problema, a decisão, a justificativa e uma checagem
    automática.
  - **Por que remover só 6 linhas.** Só saiu o que é impossível e não tem conserto: não dá para saber a idade
    verdadeira de quem está com -1, nem qual das duas datas está errada. Inventar um valor seria inventar dado.
  - **Por que a idade 0 ficou.** São 3.539 consultas de bebês com menos de 1 ano. É possível, então fica.
  - **Por que a idade acima de 100 ficou.** São 7 consultas. É raro, mas possível, e não há prova de erro.
  - **Por que as esperas longas ficaram.** A regra do IQR (intervalo interquartil) marca como *outlier* o que passa de
    Q3 + 1,5 × IQR. Na espera, Q1 = 0 e Q3 = 15 dias, então o limite é 37,5 dias, e 5.803 consultas passam dele. Mas
    elas são reais (marcar com um ou dois meses de antecedência é comum), e tirá-las apagaria justamente as consultas
    que mais faltam (32,0%). O IQR aponta o que é raro, não o que é erro.
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
| 5 | Idade 0, idade acima de 100 e esperas acima do limite do IQR mantidas | 0 |
| 6 | Coluna de deficiência (0 a 4) mantida como veio, com a dúvida registrada | 0 |
| 7 | Criada a coluna `faltou` (0 ou 1) | 0 |
| 8 | Criadas as colunas de espera, dia da semana e faixas (14 → 19 colunas) | 0 |
| 9 | Conferência final e gravação da base tratada | 0 |

### Slide 6: A, Analise os dados

- **Título:** "Quanto maior a espera, maior a chance de falta".
- **No slide:**
  - **P2, taxa de falta por tempo de espera** (gráfico, com a linha da média de 20,2%): mesmo dia 4,6%, 1-7 dias 24,1%,
    8-15 dias 30,8%, 16-30 dias 32,5% e 31+ dias 33,0%.
  - **P3, perfil de maior risco:** **40,2%** de falta entre 13 e 29 anos com 16 dias ou mais de espera, o dobro da
    média. Esse grupo é 4,9% das consultas, mas soma 9,8% das faltas.
  - **P4, o disparo de lembrete ajuda?** "Na mesma espera, quem recebe o disparo não falta mais." Gráfico sem e com
    disparo em cada faixa: 1-7 dias 24,4 x 23,8; 8-15 34,1 x 28,4; 16-30 36,8 x 29,7; 31+ 37,5 x 30,2. E a nota: "Com
    todo mundo junto, parece o contrário: 27,6% de falta com disparo e 16,7% sem. É que o disparo só vai para quem
    espera 3 dias ou mais."
- **O que falar:**
  - **A espera.** Mesmo dia: 4,6%. Com antecedência: 28,5%, cerca de 6 vezes mais. A taxa sobe até a faixa de 16 a 30
    dias e depois quase para de crescer.
  - **O cruzamento de idade e espera** (notebook 03). Em todas as idades a falta sobe com a espera, e um fator não
    apaga o outro. As quatro maiores células do mapa são as de 13 a 29 anos com 16 dias ou mais, de 39,7% a 42,5%. É o
    grupo de maior risco.
  - **O disparo, passo a passo.** (1) Na comparação crua, o disparo parece **aumentar** a falta. (2) O fator escondido é
    a espera: nenhuma consulta do mesmo dia recebeu o disparo, porque ele só aparece a partir de 3 dias de espera. O
    grupo "sem disparo" fica cheio de consultas do mesmo dia, que quase não faltam, e isso puxa a taxa dele para
    baixo. (3) Comparando dentro de cada faixa de espera, quem recebeu o disparo falta igual ou menos. Isso é uma
    **correlação espúria**: duas coisas andam juntas nos números, mas por causa de um terceiro fator.
  - **A ponte com a base.** Na apresentação o envio se chama "disparo de lembrete"; na base, o disparo registrado é o
    SMS (coluna `recebeu_sms`). São o mesmo dado.
  - **A idade, se perguntarem.** Adolescentes de 13 a 17 anos faltam mais (26,6%); quem tem 60 anos ou mais falta menos
    (15,3%). Está no dashboard, no gráfico da idade.
  - **O que não pesa.** O dia da semana quase não importa (de 19,3% a 21,2%, de segunda a sexta).
  - **O limite.** A análise é descritiva. Ela mostra associação, e **não prova causa**.
  - **Como os números chegam ao dashboard.** Base tratada → script Python → página. É a deixa para abrir o dashboard.
- **Detalhe:** [seção A do processo](processo.md#a-analise-os-dados), o
  [notebook 02](../notebooks/02_exploracao.ipynb) e o [notebook 03](../notebooks/03_grupo_de_risco.ipynb).

### Slide 7: S, Sugira decisões

- **Número grande:** **1.083** consultas a mais em seis semanas, se o grupo de risco faltasse como a média.
- **No slide:**
  - **Título:** um agente de disparo de lembretes para reduzir as faltas. Responde a P5 com base na espera (P2), no
    perfil (P3) e no disparo (P4).
  - **Classifica:** no agendamento, calcula o risco de falta pela espera e pela idade. De 13 a 29 anos, com 16 dias ou
    mais de espera, a falta é de **40,2%**.
  - **Dispara:** para quem tem risco alto, manda mais de um lembrete antes da consulta e pede confirmação.
  - **Libera:** se o paciente cancela ou não confirma, o horário é oferecido a quem está na lista de espera.
  - **O limite:** "Na base, o disparo aparece junto com menos falta, o que ainda é associação. Por isso o agente começa
    em teste: metade do grupo de risco recebe o reforço, e a outra metade não." (Ao falar, vale lembrar que é **dentro
    da mesma faixa de espera**, como no slide **A**; o dashboard escreve assim.)
  - **No fim:** "Obrigado. Perguntas?", com o link do código (github.com/cauedev30/analise-no-show-consultas) e do
    dashboard (cauedev30.github.io/analise-no-show-consultas).
- **O que falar:**
  - **Por que o agente faz sentido.** O grupo de maior risco é pequeno (4,9% da agenda, 5.422 consultas) e fácil de
    achar: a idade e a data do agendamento já estão no cadastro. Ele falta em 40,2% e soma 9,8% das faltas.
  - **O que os 1.083 querem dizer.** Se o grupo faltasse como a média (20,2%), teria cerca de 1.095 faltas; ele tem
    2.178. A diferença é o **tamanho do problema**. A conta **não diz quantas faltas o lembrete evitaria**.
  - **O canal.** O canal pensado para o disparo é o WhatsApp. Na base, o disparo registrado é o SMS.
  - **O "Libera" no lugar do overbooking.** O agente reaproveita o horário vago pela lista de espera, sem marcar acima
    da capacidade.
  - **Por que o teste.** Quem recebeu o disparo na base não foi sorteado, então a análise mostra associação. Só o teste
    (metade do grupo de risco recebe o reforço, a outra metade não) mostra quantas faltas o lembrete realmente evita.
  - **A calculadora de risco** (a recepção informa a idade e os dias de espera e vê a taxa do grupo) é o passo
    **Classifica**. Ela não foi construída: o projeto sugere a solução, não faz uma aplicação.
  - **Os outros limites.** Os dados indicam a rede pública e entram como aproximação; a clínica deve repetir o cruzamento
    de idade e espera com a própria agenda antes de aplicar. A base não tem o horário da consulta, só a data, e por
    isso o risco é medido pela espera.
- **Detalhe:** [seção S do processo](processo.md#s-sugira-decisões) e a
  [seção 4 do notebook 03](../notebooks/03_grupo_de_risco.ipynb).

---

## O dashboard

**Link:** <https://cauedev30.github.io/analise-no-show-consultas/> (publicado em 2026-11-24). Os prints estão em
[`dashboard/imagens/`](../dashboard/imagens/): [visão geral](../dashboard/imagens/visao-geral.png) e
[grupo de risco e disparo](../dashboard/imagens/grupo-de-risco.png).

**Como funciona, em uma frase:** um script Python lê a base tratada e grava os números em um arquivo; a página web lê
esse arquivo e mostra. A única conta que a página faz é a dos filtros (somar as consultas e as faltas do recorte
escolhido e dividir), pela mesma definição do slide **E**.

São **duas abas**, e nada além disso: a rubrica pede um dashboard focado nos indicadores essenciais. As abas ficam numa
barra escura no topo, ao lado do título.

| Aba | O que tem |
|---|---|
| **Visão geral** | Uma faixa com os **4 filtros** (faixa de idade, dia da semana, bairro e dias de espera) e os **3 números** (consultas, faltas e taxa de falta). Embaixo, **3 gráficos lado a lado**, um por achado: a **espera**, a **idade** e os **bairros**. Numa tela de 1366x768 cabe tudo, sem rolar, como um painel de BI; em telas mais estreitas, os gráficos ficam um embaixo do outro |
| **Grupo de risco e disparo** | De cima a baixo: o mapa de calor de idade x espera, com o grupo de maior risco contornado e 3 cartões (consultas, taxa de falta e parte das faltas); o gráfico do disparo de lembrete (a comparação crua e a comparação dentro de cada faixa de espera); e o bloco "O que recomendamos", com o agente, o 40,2% e os 1.083. Esta aba mostra sempre a base inteira: os filtros valem só na Visão geral |

### Passo a passo da demonstração (cerca de 3 minutos)

A Visão geral cabe numa tela: os filtros e os números em cima, os três gráficos embaixo, lidos da esquerda para a
direita na ordem da fala. A aba 2 se lê de cima a baixo, e cada seção surge ao entrar na tela.

| Passo | Onde | O que mostrar |
|---|---|---|
| 1 | Visão geral, sem filtro | Os três números (**110.521** consultas, **22.314** faltas e **20,2%**) e, no primeiro gráfico, a linha da espera: **4,6%** no mesmo dia, subindo até 33,0% com 31 dias ou mais (os 28,5% com antecedência são falados, como no slide **A**) |
| 2 | Visão geral, com filtro | Um filtro ao vivo. Exemplo: em "Dias de espera", escolher "Mesmo dia": os números passam a 38.562 consultas, 1.792 faltas e 4,6%, e os três gráficos mudam na mesma tela: a **espera** (linha), a **idade** (barras de desvio) e os **bairros** (pirulito). "Limpar filtros" volta ao começo |
| 3 | Grupo de risco e disparo | O mapa de calor de idade x espera e o **grupo de maior risco** contornado: 5.422 consultas, **40,2%** de falta |
| 4 | Grupo de risco e disparo | O **disparo de lembrete**: na base inteira parece aumentar a falta (27,6% contra 16,7%), mas dentro de cada faixa de espera quem recebeu falta menos ou quase igual (correlação espúria) |
| 5 | Grupo de risco e disparo, no fim | O bloco **"O que recomendamos"**, que mostra o agente (Classifica, Dispara, Libera), o 40,2% e os 1.083, e repete o slide **S** |

A equipe pode mudar a ordem (por exemplo, mostrar o dashboard entre o **A** e o **S**). O que não muda são os números.

### Por que cada forma de gráfico

Cada achado tem o gráfico do seu tipo. Se o professor perguntar, a resposta é esta:

- **Espera, linha com pontos.** É uma progressão: quanto mais espera, mais falta. Uma linha mostra a subida. Um detalhe
  importante: as faixas de espera têm **larguras diferentes** (o "mesmo dia" é 1 dia; "31+ dias" vai até 179), então a
  linha mostra a **ordem e a subida**, não distâncias proporcionais entre os pontos.
- **Idade, barras de desvio da taxa geral.** O que importa é quem fica acima ou abaixo da média. A barra vai para a
  direita acima de 20,2% e para a esquerda abaixo, e o número escrito é a taxa da faixa.
- **Bairros, pirulito.** É um ranking com nomes compridos. A linha fina com um ponto no fim deixa os nomes e os valores
  legíveis. Só entram bairros com **500 consultas ou mais** (e, com filtro, 100 ou mais no recorte), porque com poucas consultas a taxa é puro acaso (um bairro
  com 2 consultas aparece com 100% de falta).
- **Dia da semana, sem gráfico.** A taxa quase não muda, e isso cabe numa frase. O filtro fica.
- **Mapa de calor (aba 2).** Cruza duas faixas (idade e espera). Cada célula mostra a taxa e, embaixo, o número de
  consultas. O grupo de maior risco aparece contornado.
- **Barras do disparo (aba 2).** Mostram, lado a lado, a taxa sem e com disparo dentro de cada faixa de espera.

Outros cuidados da página: a cor azul é só para dados; os pontos da espera e as barras da idade com **menos de 100 consultas no recorte** aparecem em azul claro, com
o aviso de "amostra pequena" (por exemplo, ao filtrar o sábado, que tem 39 consultas); as seções surgem suavemente ao entrar na tela e as barras crescem
na entrada (mudar um filtro não anima); e quem usa "reduzir movimento" no sistema vê tudo direto.

### Como o dashboard foi feito

Em linguagem simples, em cinco passos:

1. **O Python faz as contas.** O script `scripts/gerar_dados_dashboard.py` lê a base tratada
   (`consultas_tratadas.csv`) e conta as consultas e as faltas de cada combinação de idade, dia da semana, bairro e
   espera (9.485 combinações). Ele também calcula o cruzamento de idade e espera, o grupo de maior risco, os 1.083 e a
   comparação do disparo. Tudo vai para um arquivo de cerca de 150 KB, o `painel.json`. Rodar o script duas vezes dá o
   mesmo arquivo.
2. **A página só mostra.** A página (feita com Next.js e React) lê o `painel.json` e desenha os gráficos com uma
   biblioteca chamada Recharts. Quando alguém escolhe um filtro, a página soma as consultas e as faltas das combinações
   que sobraram e divide uma pela outra: é a mesma definição de taxa de falta do projeto inteiro.
3. **Por que assim.** Os números do dashboard são os mesmos dos notebooks, porque saem da mesma base e do mesmo Python.
   A página não refaz a limpeza nem cria faixas próprias.
4. **Testes conferem os números.** Um teste em Python (18 testes) confere o `painel.json` contra os números oficiais, e
   os testes da página (79) conferem as contas dos filtros e os componentes. Sem filtro, a página tem de mostrar
   110.521, 22.314 e 20,2%.
5. **A publicação é automática.** A cada atualização da pasta `dashboard/` no GitHub, uma rotina (GitHub Actions) roda
   a conferência do código e os testes, gera o site e publica no GitHub Pages. O site é só arquivos prontos: não há
   servidor, banco de dados nem API.

Para rodar na sua máquina, veja "Como rodar" no [README](../README.md#como-rodar).

---

## Perguntas que o professor pode fazer

| Pergunta | Resposta |
|---|---|
| Por que removeram só 6 linhas? | Só removemos o que é impossível e não tem conserto: 1 idade negativa e 5 consultas antes do agendamento. O resto é raro, mas possível, e ficou |
| Esperas de até 179 dias não são *outliers*? | Pela regra do IQR, sim: 5.803 consultas passam do limite de 37,5 dias. Mas *outlier* quer dizer raro, não errado: as datas são válidas e marcar com meses de antecedência acontece. Ficaram, e são as que mais faltam (32,0%). A conferência está no Passo 5 do notebook 01 |
| Idade 0 e idade 115 não são erros? | Idade 0 são bebês com menos de 1 ano (3.539 consultas). Acima de 100 são 7 consultas: raro, mas possível, e sem prova de erro. Não mudam as taxas |
| O Kaggle diz 30% de falta. Por que 20,2%? | 30% é o subtítulo da página. Medindo nos dados, são 22.319 faltas em 110.527 consultas: 20,2% |
| Então o disparo de lembrete aumenta a falta? | Os dados não mostram isso. É uma correlação espúria: o disparo só vai para quem espera 3 dias ou mais, e quem espera mais falta mais. Dentro da mesma faixa de espera, quem recebeu o disparo falta igual ou menos |
| Então o disparo reduz a falta? | Os dados mostram a associação, mas não provam. Quem recebeu o disparo na base não foi sorteado. Para afirmar, é preciso um teste controlado, e por isso o agente começa em teste |
| Na base é SMS; por que vocês chamam de disparo? | O canal mais usado hoje é o WhatsApp, e é o canal pensado para a solução. O nome "disparo de lembrete" fica o mesmo do começo ao fim da apresentação. A base só registra o SMS (coluna `recebeu_sms`), e os números são os mesmos: o disparo da apresentação é o SMS da base |
| Por que tiraram o overbooking? | O grupo preferiu uma solução só. O enunciado não pede um número de soluções, e a proposta citava as ações como exemplos. O agente já reaproveita o horário vago pela lista de espera (o passo Libera), sem marcar acima da capacidade |
| A espera causa a falta? | A análise é descritiva: mostra que a espera é o fator mais associado à falta, não que ela é a causa |
| O que são os 1.083? | O quanto o grupo de maior risco falta acima da média: 2.178 faltas contra cerca de 1.095 se ele faltasse a 20,2%, em seis semanas. É o tamanho do problema, não quantas faltas o lembrete evitaria |
| Por que o agente começa em teste? | Porque a base mostra associação, e não causa. Com metade do grupo de risco recebendo o reforço e a outra metade não, dá para medir quantas faltas o lembrete realmente evita |
| Por que o grupo de risco é 13 a 29 anos e 16 dias ou mais? | Porque o cruzamento de idade e espera (notebook 03) mostra que as quatro maiores taxas (de 39,7% a 42,5%) são exatamente as dessas faixas. Os cortes das faixas foram fechados antes da análise |
| O setor é Saúde Privada, mas os dados indicam a rede pública? | Sim. Não há base pública de clínicas privadas. Usamos esta como aproximação e declaramos a premissa. A clínica deve conferir com os próprios dados |
| Se o paciente paga a consulta, qual é o prejuízo da clínica? | Em geral ele marca antes e só paga na hora, e o convênio só paga a consulta realizada. Quem falta não paga, e a vaga que ficou presa poderia ter sido de outro paciente pagante. Sem aviso, não dá tempo de encaixar ninguém |
| Quanto a clínica perde em dinheiro? | Não calculamos. A base não tem o valor da consulta, e ela é a única fonte do projeto. Medimos a perda em consultas: 22.314 faltas em 110.521 |
| Como garantem que o arquivo original não foi alterado? | O notebook confere o hash (a impressão digital) do arquivo antes e depois da limpeza, e é o mesmo do arquivo baixado do Kaggle |
| Por que o dashboard não é em Power BI? | O enunciado aceita ferramenta de escolha, e o professor confirmou que o Power BI é opcional. A página abre por um link, sem instalar nada, e os números continuam saindo do Python, da mesma base tratada |
| Onde está o Python no dashboard? | No script que lê a base tratada e gera os números que a página mostra |
| Por que a espera é uma linha, e a idade, barras? | Cada forma mostra o tipo do achado: a espera é uma progressão (linha); a idade mostra quem fica acima ou abaixo da média (barras de desvio). A linha mostra a ordem e a subida, não distâncias proporcionais, porque as faixas de espera têm larguras diferentes |
| Por que não há gráfico do dia da semana? | A taxa quase não muda de um dia para o outro (de 19,3% a 21,2%), então cabe numa frase. O filtro por dia da semana continua no dashboard, como a proposta prometeu |
| Por que não fizeram um modelo de previsão ou uma aplicação? | O enunciado pede diagnosticar e propor soluções com base nos dados. A ideia da calculadora de risco entrou como o passo Classifica do agente |

---

## Palavras que aparecem no projeto

| Palavra | O que quer dizer |
|---|---|
| **No-show** | O paciente marca a consulta e não comparece, sem avisar |
| **Taxa de falta** | Faltas ÷ consultas, em % |
| **Espera** | Dias de calendário entre o agendamento e a consulta |
| **Base tratada** | O arquivo depois da limpeza (`dados/tratados/consultas_tratadas.csv`). É a única base da análise e do dashboard |
| **Correlação espúria** | Duas coisas andam juntas nos números, mas a relação aparente vem de um terceiro fator escondido |
| **Associação** | Duas coisas aparecem juntas nos dados. Não quer dizer que uma causa a outra |
| **Disparo de lembrete** | O envio de um lembrete ao paciente antes da consulta. Na base, o disparo registrado é o SMS (coluna `recebeu_sms`) |
| **Agente de disparo de lembretes** | A solução recomendada, em três passos: Classifica o risco, Dispara os lembretes e Libera o horário para a lista de espera |
| **Grupo de maior risco** | Pacientes de 13 a 29 anos com 16 dias ou mais de espera: 5.422 consultas, 4,9% da agenda, falta em 40,2% |
| **Faltas acima da média** | As faltas do grupo menos as que ele teria se faltasse na taxa geral: 1.083 em seis semanas |
| **Mapa de calor** | Tabela colorida: cada célula é um cruzamento (aqui, idade x espera) e a cor mostra a taxa de falta |
| **Lista de espera** | Os pacientes que aguardam uma vaga e podem ocupar o horário liberado |
| **Indicador (KPI)** | Indicador principal. No dashboard: consultas, faltas e taxa de falta |
| **Hash** | A impressão digital de um arquivo. Se um único caractere mudar, o hash muda |

---

## O que falta fazer

O plano completo, tarefa a tarefa, está em [plano-projeto-final.md](plano-projeto-final.md). O que já está feito: o
notebook 03, os números do dashboard, o dashboard publicado e a documentação (README, processo e este guia).

| # | O que falta | O que entrega |
|---|---|---|
| ~~1~~ | ~~Conferência final com os slides~~ **Feito em 2026-11-24** | Todos os números da versão final dos slides batem com a tabela dos [números oficiais](#os-números-oficiais) e com o dashboard. O IQR do slide **L** passou a sair do notebook 01 (Passo 5) |
| ~~2~~ | ~~Execução do zero em uma cópia limpa~~ **Feito em 2026-11-24** | Os três notebooks rodaram do zero, a base tratada saiu com o mesmo hash e o `painel.json` saiu igual; 18 testes Python e 79 do dashboard passaram, e o build funcionou |
| ~~3~~ | ~~Apresentação~~ **Feita em 2026-11-24** | Os 7 slides e o dashboard |
| 4 | Envio ao professor | O link do repositório e do dashboard |
