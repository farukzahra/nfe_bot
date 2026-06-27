# Classificação: Entrada e Saída

O sistema deve separar automaticamente os documentos entre entrada e saída.

## Entrada

Documentos que representam compras, aquisições, devoluções recebidas ou entrada de mercadorias.

## Saída

Documentos que representam vendas, remessas, devoluções emitidas ou saída de mercadorias.

## Regra Inicial

A classificação usa o campo `tpNF` do XML:

- `0` = Entrada
- `1` = Saída

Em fases futuras, o sistema deve considerar CFOP e natureza da operação, porque alguns casos exigem interpretação mais detalhada — como devoluções, bonificações e remessas.
