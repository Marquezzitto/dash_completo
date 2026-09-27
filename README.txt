PROJETO RCA 61 + RCA 66

ARQUIVOS PRINCIPAIS
- index.html: dashboard
- clientes.html: carteira + SLA
- atendimento.html: Atendimento ELO
- script.js: lógica do dashboard
- rca-config.js: configuração central dos dois RCAs
- style.css: estilos

DADOS
- clientes.json: base original do RCA 61
- historico_fixo.json: histórico mensal do RCA 61
- atendimento_elo.json: snapshot ELO do RCA 61
- rca66_clientes.json: carteira do arquivo CARTEIRA RCA 66.xlsx
- rca66_atendimento_elo.json: base inicial do ELO 66, sem histórico mensal

COMO USAR
1. Coloque todos os arquivos desta pasta no mesmo diretório do site.
2. Abra index.html.
3. Use o seletor RCA para alternar entre RCA 61 e RCA 66.
4. A seleção é salva no navegador e é usada nas telas Dashboard, Clientes e Atendimento ELO.

RCA 61
- Mantém o histórico mensal existente.
- Mantém a URL atual do Apps Script do ELO.
- Mantém a base clientes.json.

RCA 66
- Usa rca66_clientes.json, gerado a partir da planilha CARTEIRA RCA 66 enviada.
- Não possui histórico mensal, conforme solicitado.
- Usa SLA por cidade quando a cidade está cadastrada na regra existente. Quando a cidade não possui regra conhecida, o sistema mostra "SLA não informado" em vez de inventar um prazo.
- O ELO possui armazenamento local separado por RCA enquanto não houver URL do Apps Script 66 configurada.

ATENDIMENTO ELO 66 — GRAVAÇÃO CENTRALIZADA
O arquivo AppsScript_AtendimentoELO_RCA66.js cria/usa uma aba "Atendimento ELO" dentro da planilha do RCA 66 e grava os atendimentos por código do cliente.

Para ativar:
1. Abra a planilha do RCA 66.
2. Extensões > Apps Script.
3. Cole o conteúdo de AppsScript_AtendimentoELO_RCA66.js.
4. Publique como Aplicativo da Web.
5. Copie a URL terminada em /exec.
6. Abra rca-config.js e coloque a URL em:
   RCA_CONFIG['66'].appsScriptUrl

Enquanto essa URL estiver vazia, o ELO 66 funciona no navegador e salva os atendimentos em localStorage separado do RCA 61. Para compartilhamento entre vários usuários/navegadores, publique o Apps Script.

OBSERVAÇÃO SOBRE SLA
A base enviada do RCA 66 não contém uma coluna de SLA. Portanto, as cidades que não aparecem na relação de SLA já existente no projeto não recebem um prazo inventado; ficam como "SLA não informado" até que a regra correta seja cadastrada.


URL atual do Apps Script RCA 66:
https://script.google.com/macros/s/AKfycbzCO-yjaRfKZd-W56n1BbFTJbyQFJVZls-k3DyjESSDJVTwtKDfJV71PkQ91UUKrTsI/exec
