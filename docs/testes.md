# Estratégia de Testes

Toda funcionalidade implementada deve ter teste vinculado. Sem teste, a tarefa não está concluída.

---

## Resumo

| Camada | Ferramenta | Tipo | Pasta |
|---|---|---|---|
| Backend | Vitest | Unitário | `backend/src/**/*.test.ts` |
| Frontend | Playwright | E2E | `frontend/e2e/**/*.spec.ts` |

---

## Backend — Testes Unitários (Vitest)

### Escopo

- Services (ex.: `auth.service.test.ts`)
- Schemas Zod (validação de entrada)
- Parsers e utilitários
- Lógica de negócio isolada

### Comandos

```bash
cd backend
npm test          # roda todos os unit tests
npm run test:watch  # modo watch (dev)
```

### Convenções

- Arquivo de teste ao lado do código ou em pasta espelhada
- Nome: `<nome>.test.ts`
- Mock do Prisma quando o teste não precisa de banco real
- Testes rápidos — sem dependência de rede ou PostgreSQL quando possível

---

## Frontend — Testes E2E (Playwright)

### Escopo

- Fluxos de login e cadastro
- Navegação entre telas
- Interações críticas (upload, filtros, chat)
- Rotas protegidas (redirect para login)

### Comandos

```bash
cd frontend
npm run test:e2e     # roda todos os E2E
npm run test:e2e:ui  # modo UI interativo (dev)
```

### Convenções

- Um spec por fluxo: `login.spec.ts`, `register.spec.ts`, `import.spec.ts`
- Usar `data-testid` nos elementos críticos quando necessário
- Backend e frontend devem estar rodando (ou usar webServer no config do Playwright)

---

## Quando Rodar

| Situação | O que rodar |
|---|---|
| Alterou backend | `cd backend && npm test` |
| Alterou frontend | `cd frontend && npm run test:e2e` |
| Alterou ambos | Rodar os dois |
| Antes de commitar | Rodar testes relacionados à mudança |
| Antes de marcar fase concluída | Rodar suite completa da camada afetada |

---

## Fase 0 — Testes mínimos

- [x] `auth.service.test.ts` — register, login, getMe
- [x] `auth.schema.test.ts` — validação Zod
- [x] `api.test.ts` — rota `/health` e auth
- [x] `login.spec.ts` — fluxo de login (em `auth.spec.ts`)
- [x] `register.spec.ts` — fluxo de cadastro (em `auth.spec.ts`)
- [x] `auth-guard.spec.ts` — redirect para `/login` sem token (em `auth.spec.ts`)
