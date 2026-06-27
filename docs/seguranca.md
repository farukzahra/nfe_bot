# Segurança

## Autenticação

- Cadastro simples com email e senha
- Login com JWT (`@fastify/jwt`)
- Senha armazenada com hash bcrypt — nunca em texto puro
- Todas as rotas da API (exceto `/auth/register` e `/auth/login`) exigem token válido

> Detalhes completos: [auth.md](./auth.md)

## Isolamento de Dados

- Cada usuário acessa **somente os próprios dados**
- Toda query no backend deve filtrar por `user_id` do token
- Importações, documentos, erros e conversas do chat pertencem ao usuário logado
- Multiempresa/tenant fica para fase futura (Fase 5)

## IA e Chatbot

- IA nunca acessa banco diretamente
- IA nunca recebe credencial do banco
- Toda função chamada pelo chatbot deve validar o `user_id` antes de executar
- Tools do chatbot retornam apenas dados do usuário autenticado

## Auditoria e Limites

- Logs de perguntas e respostas (por usuário)
- Logs de tools chamadas
- Auditoria de importações
- Rate limit em login, cadastro e chat
