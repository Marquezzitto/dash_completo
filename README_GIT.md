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


## Correção Atendimento ELO — RCA 61 e RCA 66

- `atendimento.html` não exibe SLA/Transportadora. O SLA fica somente em `clientes.html` (Base & SLAs).
- O topo do Atendimento ELO agora calcula automaticamente, para Setembro/Outubro/Novembro de 2026: feitos, faltam, percentual, dias úteis, tive retorno, sem retorno e não liguei.
- `Tive retorno` é calculado quando o campo `O que o cliente disse` está preenchido para o contato daquele mês; `Sem retorno` é contato realizado sem esse registro.
- RCA 61: a carteira é carregada da planilha do Drive do RCA 61; se o Drive não responder, usa `atendimento_elo.json` como fallback.
- RCA 66: a carteira é carregada da planilha do Drive do RCA 66; os registros de atendimento vêm da aba `Atendimento ELO` criada pelo Apps Script RCA 66; `rca66_clientes.json` é somente fallback da carteira.
- `clientes.html` também tenta primeiro a planilha correspondente de cada RCA no Drive e usa o JSON local apenas como fallback.
- Os feriados considerados no cálculo de dias úteis de 2026 são 07/09, 12/10, 02/11 e 15/11.

### Importante
Substitua os arquivos do pacote no GitHub pelos arquivos desta versão. Não misture `atendimento.html` ou `clientes.html` de versões anteriores. Depois faça `Ctrl + F5` no navegador para limpar o cache do GitHub Pages.
