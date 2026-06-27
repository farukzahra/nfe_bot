# Autenticação de Usuários

Cadastro e login simples com **email e senha**. Todo dado do sistema pertence a um usuário.

---

## Escopo do MVP

- Cadastro com email e senha
- Login com email e senha
- Sessão via JWT
- Todas as consultas e importações filtradas pelo `user_id` do usuário logado
- Sem multiempresa, sem perfis/roles, sem OAuth — apenas o essencial

---

## Tabela `users`

| Campo | Descrição |
|---|---|
| id | Identificador único |
| email | Email do usuário (único) |
| password_hash | Senha com hash (bcrypt) |
| created_at | Criação do registro |
| updated_at | Última atualização |

---

## Regra de Propriedade dos Dados

Toda entidade principal do sistema deve ter `user_id` referenciando `users.id`:

| Tabela | Campo |
|---|---|
| `fiscal_documents` | `user_id` |
| `import_batches` | `user_id` |
| `chat_conversations` | `user_id` |

Tabelas filhas (`fiscal_parties`, `fiscal_items`, `fiscal_taxes`, `import_errors`, `chat_messages`) herdam o isolamento via relação com a entidade pai.

**Regra:** o backend nunca retorna ou altera dados de outro usuário.

---

## API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro (email, senha) |
| POST | `/auth/login` | Login (email, senha) → retorna JWT |
| GET | `/auth/me` | Dados do usuário logado |

Todas as demais rotas exigem JWT válido no header `Authorization: Bearer <token>`.

---

## Frontend

| Rota | Tela |
|---|---|
| `/login` | Login |
| `/register` | Cadastro |

Rotas internas (`/import`, `/documents`, `/errors`, `/chat`) exigem autenticação. Sem token, redirecionar para `/login`.

---

## Segurança

- Senha nunca armazenada em texto puro
- Hash com **bcrypt**
- JWT assinado com `JWT_SECRET` (variável de ambiente)
- Token com expiração configurável
- Rate limit em `/auth/login` e `/auth/register`
