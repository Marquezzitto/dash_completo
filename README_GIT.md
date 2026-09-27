# RCA 61 + RCA 66

## Correções desta versão

- Mantida a regra original de SLA/transportadora do RCA 61.
- Criado `sla-config.js` compartilhado entre a Base de Clientes e o Atendimento ELO.
- RCA 61 usa `clientes.json`.
- RCA 66 usa `rca66_clientes.json`, gerado a partir da carteira enviada.
- Atendimento ELO RCA 66 usa o Apps Script publicado e a planilha Google do RCA 66.
- Histórico mensal permanece somente no RCA 61.
- O seletor de RCA fica disponível nas telas.
- Cidades do RCA 66 sem regra conhecida mostram `SLA não informado`, em vez de inventar prazo.

## Importante sobre RCA 66

A carteira enviada não possui uma coluna de SLA. Portanto, as cidades que já possuem regra equivalente ao RCA 61 recebem o SLA correspondente. Para cidades novas sem regra na tabela original, o sistema mostra `SLA não informado` até que você forneça o prazo/transportadora correto.

## Apps Script RCA 66

A URL já está configurada no `rca-config.js`:

https://script.google.com/macros/s/AKfycbzCO-yjaRfKZd-W56n1BbFTJbyQFJVZls-k3DyjESSDJVTwtKDfJV71PkQ91UUKrTsI/exec

Não é necessário colocar a planilha XLSX no Git para o sistema funcionar. O Apps Script grava diretamente na planilha Google do RCA 66.
