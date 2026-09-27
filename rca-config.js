const RCA_CONFIG = {
  "61": {
    id: "61",
    nome: "RCA 61",
    clientesUrl: "clientes.json",
    atendimentoSnapshotUrl: "atendimento_elo.json",
    driveSpreadsheetId: "1yr12JeKO-5ipBrzbqrcWFnYXhkfkQvH7tkRicbcogps",
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbw-s10eMg-8ajimxH3lK1vwo5dK_o43SLHtQa4H0sN5oHQ8VrewthA-iBxx32_RVfns/exec",
    mensalDrive: true
  },
  "66": {
    id: "66",
    nome: "RCA 66",
    clientesUrl: "rca66_clientes.json",
    atendimentoSnapshotUrl: "rca66_clientes.json",
    driveSpreadsheetId: "12ZoIQhoWn9MDPWqz-EiPMIAfoL6MiB1DAmhDLB_AaLo",
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbzCO-yjaRfKZd-W56n1BbFTJbyQFJVZls-k3DyjESSDJVTwtKDfJV71PkQ91UUKrTsI/exec",
    mensalDrive: false
  }
};

function obterRCAAtual() {
  const params = new URLSearchParams(window.location.search);
  const urlRca = params.get('rca');
  const salvo = localStorage.getItem('sistemaRCA');
  const rca = (urlRca || salvo || '61') === '66' ? '66' : '61';
  localStorage.setItem('sistemaRCA', rca);
  return rca;
}

function selecionarRCA(rca) {
  const alvo = rca === '66' ? '66' : '61';
  localStorage.setItem('sistemaRCA', alvo);
  const url = new URL(window.location.href);
  url.searchParams.set('rca', alvo);
  window.location.href = url.toString();
}

const RCA_ATUAL = obterRCAAtual();
const RCA_ATIVO = RCA_CONFIG[RCA_ATUAL];
