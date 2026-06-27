# Banco de Dados

Banco recomendado para o MVP: **PostgreSQL**

ORM: **Prisma**

> Detalhes de conexão, URLs e variáveis de ambiente: [banco-conexao.md](./banco-conexao.md)

## Tabelas Principais

### users

Armazena os usuários do sistema.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| email | Email do usuário (único) |
| password_hash | Senha com hash (bcrypt) |
| created_at | Criação do registro |
| updated_at | Última atualização |

> Detalhes de cadastro, login e JWT: [auth.md](./auth.md)

### fiscal_documents

Armazena a nota como documento principal.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| user_id | Referência ao usuário dono do documento |
| access_key | Chave de acesso da NF-e |
| document_number | Número da nota |
| series | Série |
| model | Modelo do documento |
| operation_type | Tipo de operação |
| direction | Entrada ou saída |
| issue_date | Data de emissão |
| total_amount | Valor total da nota |
| products_amount | Valor dos produtos |
| discount_amount | Valor do desconto |
| freight_amount | Valor do frete |
| tax_amount | Valor total dos impostos |
| status | Status do documento |
| raw_xml | XML original |
| source_file_name | Nome do arquivo importado |
| imported_at | Data da importação |
| created_at | Criação do registro |
| updated_at | Última atualização |

### fiscal_parties

Armazena emitente e destinatário.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| document_id | Referência ao documento |
| party_type | `issuer` ou `recipient` |
| document_number | CNPJ/CPF |
| legal_name | Razão social |
| trade_name | Nome fantasia |
| state_registration | Inscrição estadual |
| address | Endereço |
| city | Cidade |
| state | Estado |
| zip_code | CEP |

### fiscal_items

Armazena os produtos da nota.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| document_id | Referência ao documento |
| product_code | Código do produto |
| ean | EAN/código de barras |
| description | Descrição |
| ncm | NCM |
| cfop | CFOP |
| unit | Unidade |
| quantity | Quantidade |
| unit_price | Valor unitário |
| total_price | Valor total |
| discount_amount | Desconto |
| freight_amount | Frete |
| tax_amount | Impostos |

### fiscal_taxes

Armazena impostos por item ou por documento.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| document_id | Referência ao documento |
| item_id | Referência ao item (opcional) |
| tax_type | Tipo do imposto (ICMS, IPI, PIS...) |
| cst | CST |
| csosn | CSOSN |
| base_amount | Base de cálculo |
| rate | Alíquota |
| tax_amount | Valor do imposto |

### import_batches

Armazena cada lote de importação.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| user_id | Referência ao usuário dono do lote |
| file_name | Nome do arquivo |
| file_type | Tipo (xml, zip) |
| total_files | Total de arquivos no lote |
| success_count | Importados com sucesso |
| error_count | Erros |
| imported_at | Data da importação |
| status | Status do lote |

### import_errors

Armazena erros de importação.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| batch_id | Referência ao lote |
| file_name | Nome do arquivo com erro |
| error_message | Mensagem de erro |
| raw_content | Conteúdo original do arquivo |
| created_at | Criação do registro |

### chat_conversations

Armazena conversas do chatbot por usuário.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| user_id | Referência ao usuário |
| title | Título da conversa (gerado automaticamente) |
| created_at | Criação do registro |
| updated_at | Última atualização |

### chat_messages

Armazena mensagens de cada conversa.

| Campo | Descrição |
|---|---|
| id | Identificador único |
| conversation_id | Referência à conversa |
| role | `user` ou `assistant` |
| content | Conteúdo da mensagem |
| created_at | Criação do registro |
