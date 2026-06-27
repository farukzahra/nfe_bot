# Fases de Implementação

Controle de progresso do desenvolvimento. Marcar cada item ao concluir.

**Legenda:** `[ ]` pendente · `[x]` concluído

---

## Fase 0 — Fundação do Projeto

- [x] Estrutura `backend/` (Fastify + TypeScript + Prisma)
- [x] Estrutura `frontend/` (Vue 3 + Vite + Vuetify 3 + Pinia + Vue Router)
- [x] `.env.example` com `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- [x] Schema Prisma: `users`, tabelas fiscais com `user_id`
- [x] Cadastro (`POST /auth/register`) — email e senha
- [x] Login (`POST /auth/login`) — retorna JWT
- [x] Rota `GET /auth/me`
- [x] Middleware de autenticação JWT nas rotas protegidas
- [x] Telas `/login` e `/register`
- [x] Layout base com menu e logout
- [x] Rotas protegidas no frontend (redirect para `/login`)
- [x] Health check da API
- [x] Testes unitários backend (Vitest): auth, health, schemas
- [x] Testes E2E frontend (Playwright): login, register, auth guard
- [x] Rodar testes relacionados e garantir que passam
- [x] Backend e frontend sobem localmente

**Critério de pronto:** app roda localmente, usuário consegue se cadastrar, logar e ver layout autenticado.

---

## Fase 1 — Importação de XML/ZIP

- [x] Upload de `.xml` via API
- [x] Upload de `.zip` via API
- [x] Parser NF-e/NFC-e com `fast-xml-parser`
- [x] Extração dos campos definidos em `docs/dados.md`
- [x] Classificação entrada/saída via `tpNF`
- [x] Persistência: `fiscal_documents`, `fiscal_parties`, `fiscal_items`, `fiscal_taxes`
- [x] Persistência: `import_batches` e `import_errors`
- [x] Vincular importação ao `user_id` do token
- [x] Tela `/import` com drag & drop
- [x] Resumo do resultado após importação (sucesso/erros)
- [x] Validação de entrada com Zod

**Critério de pronto:** usuário logado importa XML/ZIP e dados ficam salvos no PostgreSQL.

---

## Fase 2 — CRUD e Consulta de Documentos

- [ ] Tela `/documents` com abas Entrada / Saída / Todos
- [ ] Filtros: data, CNPJ, status, valor
- [ ] Drawer com resumo da nota
- [ ] Página `/documents/:id` com abas: Dados, Itens, Impostos, XML
- [ ] Tela `/errors` com listagem e modal de detalhe
- [ ] Reprocessar documento
- [ ] Excluir importação
- [ ] Corrigir classificação manualmente
- [ ] Todas as queries filtradas por `user_id`

**Critério de pronto:** CRUD funcional sobre os documentos importados pelo usuário logado.

---

## Fase 3 — Chatbot Gerencial

- [ ] Tela `/chat` com layout de conversa
- [ ] Histórico de conversas por usuário (`chat_conversations`, `chat_messages`)
- [ ] Integração Vercel AI SDK + tool calling
- [ ] Tool: `getSalesSummary`
- [ ] Tool: `getPurchasesSummary`
- [ ] Tool: `getTopSellingProducts`
- [ ] Tool: `getTopCustomers`
- [ ] Tool: `getTopSuppliers`
- [ ] Tool: `getProductHistory`
- [ ] Tool: `getImportedDocuments`
- [ ] Tool: `getImportErrors`
- [ ] Tools filtradas por `user_id` (sem SQL livre)
- [ ] Logs de perguntas, respostas e tools chamadas

**Critério de pronto:** perguntas como "quanto vendi este mês?" respondidas com dados reais do usuário.

---

## Fase 4 — Relatórios e Margem

- [ ] Tool: `getEstimatedMargin`
- [ ] Margem estimada (custo entrada vs preço saída)
- [ ] Relatórios por período na UI
- [ ] Dashboards simples
- [ ] Alertas básicos (produto sem saída, erros de importação)

**Critério de pronto:** relatórios e margem estimada disponíveis na UI.

---

## Fase 4.5 — Tela Sobre: Tabela de Histórico de Commits

- [x] Substituir `v-data-table` por `v-table` estático e elegante
- [x] Exibir colunas: hash, tipo (badge colorido), scope, mensagem, data/hora
- [x] Ordenar do mais recente para o mais antigo (backend já ordena por timestamp)
- [x] Estilo changelog: linhas alternadas, fonte monoespaçada nos hashes
- [x] Remover paginação e controles desnecessários — exibir tudo de uma vez
- [x] Manter botão Atualizar e indicador de última leitura

**Critério de pronto:** tela Sobre exibe commits em tabela limpa e sem poluição visual.

---

## Fase 5 — Expansão (futuro)

- [ ] Multiempresa / tenant
- [ ] Integração com ERP
- [ ] Certificado digital
- [ ] Busca automática de XMLs
- [ ] MCP server opcional
- [ ] Planos pagos

**Critério de pronto:** definido por sub-feature quando chegar a hora.

---

## Ordem de execução

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 4.5 → Fase 5
```

**Fase atual:** Fase 2 — CRUD e Consulta de Documentos
