const RCA_CONFIG = {
  "61": {
    id: "61",
    nome: "RCA 61",
    clientesUrl: "clientes.json",
    eloSnapshotUrl: "atendimento_elo.json",
    driveSpreadsheetId: "1yr12JeKO-5ipBrzbqrcWFnYXhkfkQvH7tkRicbcogps",
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbw-s10eMg-8ajimxH3lK1vwo5dK_o43SLHtQa4H0sN5oHQ8VrewthA-iBxx32_RVfns/exec",
    temHistoricoMensal: true
  },
  "66": {
    id: "66",
    nome: "RCA 66",
    clientesUrl: "rca66_clientes.json",
    eloSnapshotUrl: "atendimento_elo.json",
    driveSpreadsheetId: "12ZoIQhoWn9MDPWqz-EiPMiafoL6MiB1DAmhDLB_AaLo",
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbzCO-yjaRfKZd-W56n1BbFTJbyQFJVZls-k3DyjESSDJVTwtKDfJV71PkQ91UUKrTsI/exec",
    temHistoricoMensal: false
  }
};

function getRcaSelecionado() {
  return localStorage.getItem("rcaSelecionado") === "66" ? "66" : "61";
}

function setRcaSelecionado(id) {
  const rca = id === "66" ? "66" : "61";
  localStorage.setItem("rcaSelecionado", rca);
  return rca;
}

function obterConfigRca(id) {
  return RCA_CONFIG[id || getRcaSelecionado()];
}

function criarSeletorRcaHtml() {
  const atual = getRcaSelecionado();
  return `
    <div class="filter-group" style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:.75rem;color:#94a3b8;font-weight:700;">RCA</span>
      <select id="seletorRcaGlobal" style="min-width:110px;padding:7px 10px;border-radius:7px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-weight:700;">
        <option value="61" ${atual === "61" ? "selected" : ""}>RCA 61</option>
        <option value="66" ${atual === "66" ? "selected" : ""}>RCA 66</option>
      </select>
    </div>`;
}

function instalarSeletorRca() {
  const el = document.getElementById("seletorRcaGlobal");
  if (!el) return;
  el.value = getRcaSelecionado();
  el.addEventListener("change", () => {
    setRcaSelecionado(el.value);
    location.reload();
  });
}

async function carregarClientesDaRca() {
  const cfg = obterConfigRca();
  const res = await fetch(`${cfg.clientesUrl}?v=${Date.now()}`);
  if (!res.ok) throw new Error(`Falha ao carregar ${cfg.clientesUrl}`);
  return await res.json();
}
