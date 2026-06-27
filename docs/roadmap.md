# Roadmap

## Fase 0 — Fundação

- Estrutura backend (Fastify + TypeScript + Prisma)
- Estrutura frontend (Vue 3 + Vite + Vuetify)
- Cadastro e login (email + senha, JWT)
- Schema do banco com `users` e `user_id` nas tabelas principais
- Layout base com rotas protegidas

## Fase 1 — Importação

- Upload de XML
- Upload de ZIP
- Parser de NF-e/NFC-e
- Persistência no PostgreSQL
- Separação entrada/saída
- Tela de resumo da importação

## Fase 2 — CRUD

- CRUD dos documentos importados
- Filtros
- Visualização da nota
- Visualização dos itens
- Correção manual
- Erros de importação

## Fase 3 — Chatbot

- Chatbot gerencial
- Tool calling no backend
- Consultas sobre vendas/compras
- Resumos por período
- Top produtos/clientes/fornecedores

## Fase 4 — Relatórios

- Margem estimada
- Relatórios gerenciais
- Alertas automáticos
- Dashboards simples

## Fase 5 — Expansão

- Multiempresa / tenant (múltiplos usuários por empresa)
- Integrações com ERP
- Integração com certificado digital
- Busca automática de XMLs
- MCP server opcional
- Planos pagos
