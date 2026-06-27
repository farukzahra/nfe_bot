# Telas do Sistema

Inventário de todas as telas, rotas, padrões de UI e ações disponíveis.

---

## Visão Geral das Rotas

| Rota | Tela |
|---|---|
| `/` | Redirect para `/documents` |
| `/import` | Importação de arquivos |
| `/documents` | Lista de documentos fiscais |
| `/documents/:id` | Detalhe de um documento |
| `/errors` | Erros de importação |
| `/chat` | Chatbot gerencial |

---

## 1. Tela de Importação

**Rota:** `/import`
**Padrão:** Página simples com área de upload

### Componentes

- Área de drag & drop para arquivos
- Botão de seleção de arquivo
- Formatos aceitos visíveis: `.xml`, `.zip`
- Barra de progresso durante o processamento
- Resumo do resultado após importação:
  - Total de arquivos processados
  - Importados com sucesso
  - Erros encontrados
  - Link para ver os erros, quando houver

### Ações

- Arrastar e soltar arquivo
- Selecionar arquivo pelo navegador
- Cancelar importação em andamento
- Ver detalhes dos erros após importação

---

## 2. Lista de Documentos Fiscais

**Rota:** `/documents`
**Padrão:** List + Drawer

### Layout

- Abas no topo: **Entradas** | **Saídas** | **Todos**
- Lista de documentos com colunas principais
- Clicar em um item abre um **drawer lateral** com o resumo da nota
- Botão para abrir a página completa a partir do drawer

### Colunas da Lista

- Número da nota
- Emitente/Destinatário (depende da aba)
- Data de emissão
- Valor total
- Status (Autorizada / Cancelada / Denegada)
- Direção (Entrada / Saída)

### Filtros

- Período (data inicial e final)
- Direção (Entrada / Saída)
- CNPJ do emitente ou destinatário
- Status do documento
- Valor mínimo e máximo

### Ações

- Visualizar detalhe (abre drawer)
- Abrir página completa
- Reprocessar documento
- Excluir importação
- Corrigir classificação manualmente

---

## 3. Detalhe do Documento

**Rota:** `/documents/:id`
**Padrão:** Page com abas

### Abas

| Aba | Conteúdo |
|---|---|
| **Dados Gerais** | Informações do documento, emitente, destinatário, totais, transporte, pagamento |
| **Itens** | Tabela com todos os produtos da nota |
| **Impostos** | Tabela de impostos por item ou por documento |
| **XML Original** | Visualizador do XML bruto |

### Ações

- Voltar para a lista
- Reprocessar documento
- Excluir importação
- Corrigir classificação manualmente

---

## 4. Erros de Importação

**Rota:** `/errors`
**Padrão:** List + Modal

### Componentes

- Lista de erros com colunas:
  - Nome do arquivo
  - Mensagem do erro
  - Data
  - Lote de importação
- Clicar em um erro abre um **modal** com:
  - Mensagem completa do erro
  - Conteúdo bruto do arquivo, quando disponível

### Ações

- Ver detalhe do erro
- Tentar reprocessar o arquivo
- Excluir erro

---

## 5. Chatbot Gerencial

**Rota:** `/chat`
**Padrão:** Layout fixo de chat

### Layout

```
┌──────────────┬─────────────────────────────────┐
│  Histórico   │  Conversa atual                  │
│  de chats    │                                  │
│  ──────────  │  [mensagem do usuário]            │
│  Chat 1      │  [resposta da IA]                 │
│  Chat 2      │  [mensagem do usuário]            │
│  + Novo      │  [resposta da IA]                 │
│              │  ─────────────────────────────    │
│              │  [ campo de texto ] [enviar]      │
└──────────────┴─────────────────────────────────┘
```

### Componentes

- Sidebar com histórico de conversas
- Área principal com mensagens
- Campo de texto na parte inferior
- Indicador de "digitando" durante a resposta da IA
- Respostas da IA com suporte a markdown (tabelas, listas, negrito)

### Ações

- Enviar mensagem
- Iniciar nova conversa
- Acessar conversa anterior do histórico
- Copiar resposta da IA
