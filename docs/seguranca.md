# Segurança

O sistema deve garantir:

- Isolamento por empresa/tenant
- Usuário só acessa dados da própria empresa
- IA nunca acessa banco diretamente
- IA nunca recebe credencial do banco
- Toda função chamada pelo chatbot deve validar permissão
- Logs de perguntas e respostas
- Logs de tools chamadas
- Auditoria de importações
- Limite de uso por usuário
