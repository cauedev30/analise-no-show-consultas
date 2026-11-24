# Dashboard de no-show

Página web (Next.js e React) com a taxa de falta em consultas e filtros por idade, dia da semana, bairro e dias de
espera. Os números não são calculados aqui: o Python (`scripts/gerar_dados_dashboard.py`) lê a base tratada e grava
`public/dados/painel.json`; a página só lê esse arquivo e mostra.

## Como rodar

Precisa do Node 20 ou mais novo. Dentro desta pasta (`dashboard/`):

```bash
npm install      # uma vez, baixa as dependências
npm run dev      # abre em http://localhost:3000
npm test         # testes das contas (Vitest)
npm run lint     # confere o código
npm run build    # gera o site estático em out/
```

O build usa o caminho base `/analise-no-show-consultas`, que é o do GitHub Pages. Em desenvolvimento a página abre na
raiz.

Para atualizar os números, rode o script Python na raiz do repositório e refaça o build:

```bash
python scripts/gerar_dados_dashboard.py
```
