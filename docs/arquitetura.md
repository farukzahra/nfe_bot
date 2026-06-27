# Arquitetura

## Fluxo MVP

O chatbot acessa o backend da aplicação, não diretamente o banco.

```txt
Frontend Chat
   ↓
Backend API (Fastify)
   ↓
LLM com Tool Calling (Vercel AI SDK)
   ↓
Services internos
   ↓
PostgreSQL (via Prisma)
```

## Por que não usar MCP no começo?

MCP é útil quando você quer expor ferramentas padronizadas para vários agentes ou clientes diferentes.

Para este MVP, o melhor é o chatbot chamar funções do próprio backend.

Motivos:

- Mais simples
- Mais seguro
- Menos infraestrutura
- Mais fácil de controlar permissões
- Mais fácil de auditar
- Mais fácil de testar
- Menor custo inicial
- Menos pontos de falha

## Quando MCP faria sentido?

MCP pode fazer sentido em uma fase futura, quando:

- O sistema tiver vários agentes
- Clientes externos precisarem conectar seus próprios assistentes
- Você quiser expor ferramentas padronizadas
- O backend virar uma plataforma
- Houver integrações com ERP, CRM, BI, Google Drive, e-mail etc.

Para o MVP:

> Backend com tool calling é suficiente e melhor.

## Decisão Arquitetural Principal

> O chatbot deve acessar o backend da aplicação por meio de tools/funções controladas.

MCP deve ser considerado apenas em uma fase posterior, quando o produto já tiver maturidade e necessidade real de expor ferramentas para múltiplos agentes ou integrações externas.
