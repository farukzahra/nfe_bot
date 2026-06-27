# Sistema de Importação de NF-e/NFC-e com Chatbot Gerencial

> Importar XML/PDF de NF-e/NFC-e, organizar entrada e saída, armazenar os dados no banco e permitir consultas inteligentes sobre compras, vendas, produtos, clientes, fornecedores e margem estimada.

---

## Índice de Documentação

| # | Documento | Descrição |
|---|---|---|
| 1 | [Visão Geral](./docs/overview.md) | Objetivo e proposta do sistema |
| 2 | [Fase 1 — Importação](./docs/fase1-importacao.md) | Upload de XML, ZIP e PDF |
| 3 | [Dados a Extrair](./docs/dados.md) | Todos os campos extraídos da NF-e/NFC-e |
| 4 | [Classificação Entrada/Saída](./docs/classificacao.md) | Regras de separação de documentos |
| 5 | [Banco de Dados](./docs/banco-de-dados.md) | Tabelas, campos e modelo de dados |
| 5.1 | [Conexões com o Banco](./docs/banco-conexao.md) | URLs de dev e produção, variáveis de ambiente |
| 6 | [Fase 2 — CRUD](./docs/fase2-crud.md) | Tela de visualização e correção dos imports |
| 6.1 | [Telas](./docs/telas.md) | Inventário de telas, rotas, padrões de UI e ações |
| 7 | [Fase 3 — Chatbot](./docs/fase3-chatbot.md) | Chatbot gerencial, margem e tool calling |
| 8 | [Arquitetura](./docs/arquitetura.md) | Fluxo do sistema, decisões e MCP |
| 9 | [Stack](./docs/stack.md) | Stack técnica Full JS detalhada |
| 10 | [Segurança](./docs/seguranca.md) | Isolamento, permissões e auditoria |
| 11 | [Roadmap](./docs/roadmap.md) | Fases planejadas do produto |

---

## Estrutura de Arquivos

```
nfe_bot/
├── docs/
│   ├── overview.md
│   ├── fase1-importacao.md
│   ├── dados.md
│   ├── classificacao.md
│   ├── banco-de-dados.md
│   ├── fase2-crud.md
│   ├── fase3-chatbot.md
│   ├── arquitetura.md
│   ├── seguranca.md
│   ├── roadmap.md
│   └── stack.md
└── main.md
```
