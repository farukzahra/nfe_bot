# Dados a Extrair da NF-e/NFC-e

O sistema deve tentar extrair tudo que existir no documento.

## Dados do Documento

- Chave de acesso
- Número da nota
- Série
- Modelo do documento
- Tipo de operação
  - Entrada
  - Saída
- Data de emissão
- Data de saída/entrada
- Natureza da operação
- Finalidade da nota
- Status do documento
  - Autorizada
  - Cancelada
  - Denegada
  - Inutilizada, quando aplicável

## Emitente

- CNPJ/CPF
- Razão social
- Nome fantasia
- Inscrição estadual
- Endereço
- Cidade
- Estado
- CEP

## Destinatário

- CNPJ/CPF
- Razão social/nome
- Inscrição estadual
- Endereço
- Cidade
- Estado
- CEP

## Produtos

Para cada item da nota:

- Código do produto
- EAN/código de barras
- Descrição
- NCM
- CFOP
- Unidade
- Quantidade
- Valor unitário
- Valor total
- Desconto
- Frete
- Seguro
- Outras despesas
- Valor aproximado dos tributos, quando existir

## Impostos

Extrair quando disponível:

- ICMS
- ICMS ST
- IPI
- PIS
- COFINS
- ISS, quando aplicável
- CST/CSOSN
- Base de cálculo
- Alíquotas
- Valores

## Totais da Nota

- Valor dos produtos
- Valor total da nota
- Valor do desconto
- Valor do frete
- Valor do seguro
- Outras despesas
- Valor total dos impostos
- Valor de ICMS
- Valor de ICMS ST
- Valor de IPI
- Valor de PIS
- Valor de COFINS

## Transporte

- Modalidade do frete
- Transportadora
- CNPJ/CPF da transportadora
- Placa do veículo
- UF do veículo
- Quantidade de volumes
- Peso líquido
- Peso bruto

## Pagamento

- Forma de pagamento
- Valor pago
- Troco
- Parcelas, quando existirem
