# Conexões com o Banco de Dados

O banco PostgreSQL sempre roda externamente — nunca em container junto com a aplicação.

---

## Ambientes

### Local (dev)

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Porta | `5432` |
| Usuário | `postgres` |
| Senha | `postgres` |
| Banco | `nfe` |

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/nfe
```

### Produção (VPS)

| Campo | Valor |
|---|---|
| Host | `66.23.231.218` |
| Porta | `5432` |
| Usuário | `financeiro` |
| Senha | ver `POSTGRES_PASSWORD` em `/opt/financeiro/.env` na VPS |
| Banco | `nfe` |
| App URL | `financeiro.faruk.dev.br` |

```env
DATABASE_URL=postgres://financeiro:<POSTGRES_PASSWORD>@66.23.231.218:5432/nfe
```

> A senha de produção **não deve ser versionada**. Sempre ler de variável de ambiente.

---

## Arquivo .env

O projeto deve ter um `.env.example` versionado e um `.env` local ignorado pelo git.

### .env.example

```env
# Banco de Dados
DATABASE_URL=postgres://postgres:postgres@localhost:5432/nfe

# IA
OPENAI_API_KEY=
# ou
ANTHROPIC_API_KEY=
# ou
GOOGLE_GENERATIVE_AI_API_KEY=

# App
NODE_ENV=development
PORT=3000

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

### .gitignore

```
.env
.env.local
.env.production
```

---

## Observações

- O banco de produção está na mesma VPS que a aplicação (`financeiro.faruk.dev.br`)
- A conexão de produção deve usar pool de conexões (Prisma já gerencia isso)
- Nunca expor `DATABASE_URL` em logs ou respostas da API
