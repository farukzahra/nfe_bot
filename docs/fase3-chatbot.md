# Fase 3 — Chatbot Gerencial

Após os dados estarem estruturados no banco, será criado um chatbot para conversar com as informações fiscais e comerciais.

## Exemplos de Perguntas

- Quanto vendi hoje?
- Quanto vendi este mês?
- Qual produto mais saiu?
- Qual fornecedor mais apareceu nas compras?
- Quanto comprei de determinado fornecedor?
- Quais produtos tiveram maior valor de venda?
- Quais produtos aparecem em entrada mas não aparecem em saída?
- Quais clientes compraram mais?
- Quais notas foram importadas esta semana?
- Quantas notas de entrada e saída tenho no mês?
- Qual foi o ticket médio das saídas?
- Qual foi o valor total de compras no período?
- Qual foi o valor total de vendas no período?

## Margem Estimada

Para calcular margem, o sistema precisa relacionar:

- Custo de entrada
- Preço de saída

A margem inicial deve ser tratada como estimada.

Exemplo:

> Com base no último custo de compra conhecido, a margem estimada desse produto foi de 28%.

Sem custo conhecido, o chatbot deve responder:

> Ainda não tenho custo de compra suficiente para calcular margem desse produto.

## Tools/Funções do Chatbot

O chatbot não deve gerar SQL livre. Ele deve chamar funções seguras do backend.

```txt
getSalesSummary(startDate, endDate)
getPurchasesSummary(startDate, endDate)
getTopSellingProducts(startDate, endDate, limit)
getTopCustomers(startDate, endDate, limit)
getTopSuppliers(startDate, endDate, limit)
getProductHistory(productCode, startDate, endDate)
getImportedDocuments(direction, startDate, endDate)
getImportErrors(startDate, endDate)
getEstimatedMargin(productCode, startDate, endDate)
```

Essas funções executam SQL seguro no backend e retornam dados estruturados para a IA explicar.
