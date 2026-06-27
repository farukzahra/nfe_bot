# Stack Técnica — Full JavaScript

Stack recomendada para o projeto NFe Bot, utilizando JavaScript/TypeScript em toda a aplicação.

---

## Backend — Node.js

### Runtime e Framework

| Tecnologia | Motivo |
|---|---|
| **Node.js 22+** | Runtime principal |
| **Fastify** | Framework HTTP — mais rápido que Express, TypeScript nativo, ecossistema rico de plugins |
| **TypeScript** | Tipagem estática, essencial para um sistema fiscal com muitos modelos de dados |

> Express é uma alternativa válida, mas o Fastify entrega melhor performance e suporte a TypeScript sem configuração extra.

### Banco de Dados

| Tecnologia | Motivo |
|---|---|
| **PostgreSQL** | Banco relacional robusto, já definido no projeto |
| **Prisma** | Melhor ORM para Node.js + PostgreSQL — migrations, type safety e query builder intuitivo |

### Validação e Serialização

| Tecnologia | Motivo |
|---|---|
| **Zod** | Validação de schemas com inferência de tipos TypeScript — ideal para validar XMLs e payloads |

### Importação de Documentos Fiscais

| Tecnologia | Motivo |
|---|---|
| **fast-xml-parser** | Parser de XML rápido e leve — suporte completo ao padrão NF-e/NFC-e |
| **@fastify/multipart** | Upload de arquivos integrado ao Fastify |
| **adm-zip** | Leitura de arquivos ZIP com múltiplos XMLs |

### Autenticação e Segurança

| Tecnologia | Motivo |
|---|---|
| **@fastify/jwt** | JWT nativo para Fastify |
| **bcryptjs** | Hash de senhas |
| **@fastify/rate-limit** | Limite de requisições por usuário |
| **@fastify/cors** | CORS controlado |
| **@fastify/helmet** | Headers de segurança HTTP |

### IA e Chatbot

| Tecnologia | Motivo |
|---|---|
| **OpenAI SDK** (`openai`) | Tool calling/function calling para o chatbot gerencial |
| **Vercel AI SDK** (`ai`) | Alternativa — abstrai múltiplos provedores (OpenAI, Anthropic, Gemini) com streaming fácil |

> Recomendação: usar o **Vercel AI SDK** por ser agnóstico de provedor — facilita trocar de modelo no futuro sem refatorar.

### Utilitários

| Tecnologia | Motivo |
|---|---|
| **dayjs** | Manipulação de datas (mais leve que moment.js) |
| **pino** | Logger de alta performance (já integrado ao Fastify) |
| **dotenv** | Variáveis de ambiente |

---

## Frontend — Vue 3

### Core

| Tecnologia | Motivo |
|---|---|
| **Vue 3** | Framework principal |
| **Vite** | Build tool rápido, recomendado oficialmente pelo Vue |
| **TypeScript** | Consistência com o backend |
| **Vuetify 3** | UI Component Library — Material Design, pronta para produção |

### Estado e Roteamento

| Tecnologia | Motivo |
|---|---|
| **Pinia** | State management oficial do Vue 3 |
| **Vue Router 4** | Roteamento oficial |

### HTTP e Comunicação

| Tecnologia | Motivo |
|---|---|
| **ofetch** | Cliente HTTP moderno (usado internamente pelo Nuxt) — alternativa ao Axios |

### Ferramentas de Desenvolvimento

| Tecnologia | Motivo |
|---|---|
| **ESLint** + **Prettier** | Padronização de código |
| **Vitest** | Testes unitários — mesmo ecossistema do Vite |
| **Vue DevTools** | Debug de componentes e estado |

---

## Infraestrutura

| Tecnologia | Motivo |
|---|---|
| **Docker** + **Docker Compose** | Ambiente padronizado — backend, frontend e PostgreSQL em containers |
| **PostgreSQL** (container) | Banco de dados isolado |
| **Redis** (opcional) | Cache de sessões e respostas do chatbot em fases futuras |

---

## Estrutura de Repositório Sugerida

```
nfe_bot/
├── backend/          # Node.js + Fastify
│   ├── src/
│   │   ├── modules/
│   │   │   ├── import/       # Importação de XMLs/ZIPs/PDFs
│   │   │   ├── documents/    # CRUD de documentos fiscais
│   │   │   ├── chatbot/      # Lógica do chatbot e tool calling
│   │   │   └── auth/         # Autenticação
│   │   ├── shared/           # Utilitários, tipos, helpers
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── frontend/         # Vue 3 + Vite + Vuetify
│   ├── src/
│   │   ├── views/
│   │   │   ├── ImportView.vue
│   │   │   ├── DocumentsView.vue
│   │   │   └── ChatView.vue
│   │   ├── components/
│   │   ├── stores/           # Pinia
│   │   └── router/
│   └── package.json
│
├── docker-compose.yml
├── main.md
└── stack.md
```

---

## Resumo das Escolhas Principais

| Camada | Escolha | Alternativa descartada |
|---|---|---|
| Framework backend | Fastify | Express (mais lento, menos tipado) |
| ORM | Prisma | TypeORM (mais verboso) |
| Validação | Zod | Joi (sem integração TypeScript nativa) |
| Parser XML | fast-xml-parser | xml2js (API mais antiga) |
| IA SDK | Vercel AI SDK | OpenAI SDK direto (acoplado ao provedor) |
| UI | Vuetify 3 | Quasar / PrimeVue |
| Testes | Vitest | Jest (mais lento com Vite) |
