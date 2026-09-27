/* ============================================================
   DASHBOARD PRINCIPAL — RCA 61 + RCA 66
   O RCA selecionado é compartilhado entre as telas por localStorage.
   ============================================================ */

let dashboardClientes = [];
let historicoRca61 = null;
let charts = {};
let dadosUpload1 = null;
let dadosUpload2 = null;

const fmtBRL = value => Number(value || 0).toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 2
});
const fmtPct = value => `${(Number(value || 0) * 100).toFixed(1).replace('.', ',')}%`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function destroyChart(id) {
  if (charts[id]) {
    charts[id].destroy();
    charts[id] = null;
  }
}

function showChartNotice(canvasId, message) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  destroyChart(canvasId);
  const parent = canvas.parentElement;
  let notice = parent.querySelector('.rca-chart-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.className = 'rca-chart-notice';
    notice.style.cssText = 'height:100%;min-height:220px;display:flex;align-items:center;justify-content:center;text-align:center;color:#94a3b8;padding:20px;line-height:1.5;';
    parent.appendChild(notice);
  }
  notice.textContent = message;
  canvas.style.display = 'none';
}

function restoreChartCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  canvas.style.display = '';
  const notice = canvas.parentElement.querySelector('.rca-chart-notice');
  if (notice) notice.remove();
}

function montarSeletorDashboard() {
  const el = document.getElementById('seletorRcaDashboard');
  if (!el) return;
  el.innerHTML = criarSeletorRcaHtml();
  const select = el.querySelector('[data-rca-selector]');
  if (select) select.onchange = () => definirRcaSelecionado(select.value);
}

function atualizarCabecalhoDashboard() {
  const cfg = obterConfigRca();
  const title = document.querySelector('[data-rca-title]');
  if (title) title.textContent = cfg.nome;
  document.title = `Dashboard de Vendas & Carteira - ${cfg.nome}`;
  const status = document.getElementById('badgeText');
  if (status) status.textContent = `Base ${cfg.nome}`;
}

async function carregarBaseDashboard() {
  dashboardClientes = await carregarClientesDaRca();
  const cfg = obterConfigRca();
  historicoRca61 = null;
  if (cfg.temHistoricoMensal && cfg.historicoJson) {
    try {
      const r = await fetch(cfg.historicoJson, { cache: 'no-store' });
      if (r.ok) historicoRca61 = await r.json();
    } catch (e) {
      console.warn('Histórico fixo não carregado:', e);
    }
  }
}

function preencherFiltroClientes() {
  const select = document.getElementById('selectCliente');
  if (!select) return;
  select.innerHTML = '<option value="ALL">Todos os Clientes</option>';
  [...dashboardClientes]
    .sort((a,b) => a.cliente.localeCompare(b.cliente, 'pt-BR'))
    .forEach(c => {
      const opt = document.createElement('option');
      opt.value = String(c.codigo);
      opt.textContent = `${c.codigo} - ${c.cliente}`;
      select.appendChild(opt);
    });
}

function clientesFiltrados() {
  const codigo = document.getElementById('selectCliente')?.value || 'ALL';
  return codigo === 'ALL' ? dashboardClientes : dashboardClientes.filter(c => String(c.codigo) === String(codigo));
}

function dataBRParaDate(s) {
  if (!s) return null;
  if (s instanceof Date) return s;
  const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function diasDesdeUltimaVenda(data) {
  const d = dataBRParaDate(data);
  if (!d) return null;
  const hoje = new Date();
  const diff = hoje.getTime() - d.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function renderizarKpis() {
  const cfg = obterConfigRca();
  const clientes = clientesFiltrados();
  const mes = document.getElementById('selectMes')?.value || 'ALL';

  let valor = clientes.reduce((s,c) => s + Number(c.valor || 0), 0);
  let positivos = clientes.filter(c => Number(c.valor || 0) > 0).length;
  let budget = 0;
  let gravadas = 0;

  if (cfg.id === '61' && historicoRca61) {
    const meses = mes === 'ALL' ? historicoRca61.meses_disponiveis : [Number(mes)];
    const porCliente = historicoRca61.porCliente || {};
    const rows = meses.flatMap(m => porCliente[String(m)] || []);
    const codigoSelecionado = document.getElementById('selectCliente')?.value || 'ALL';
    const rowsFiltradas = codigoSelecionado === 'ALL' ? rows : rows.filter(r => String(r.Cliente_Pai || '').startsWith(`${codigoSelecionado}-`));
    if (rowsFiltradas.length) {
      valor = rowsFiltradas.reduce((s,r) => s + Number(r['Valor de venda (R$)'] || 0), 0);
      positivos = new Set(rowsFiltradas.map(r => r.Cliente_Pai)).size;
    }
  }

  const total = clientes.length;
  const positivacao = total ? positivos / total : 0;
  document.getElementById('kpiValorMensal').textContent = fmtBRL(valor);
  document.getElementById('kpiBudgetAtingido').textContent = cfg.id === '66' ? '—' : `${budget.toFixed(1).replace('.', ',')}%`;
  document.getElementById('kpiPositivacao').textContent = `${positivos} / ${total}`;
  document.getElementById('kpiPositivacaoSub').textContent = `Real: ${fmtPct(positivacao)} | Base: ${cfg.nome}`;
  document.getElementById('kpiPctGravadas').textContent = cfg.id === '66' ? '—' : `${gravadas.toFixed(1).replace('.', ',')}%`;
  document.getElementById('kpiPctGravadasSub').textContent = cfg.id === '66' ? 'RCA 66 não possui histórico mensal nesta base' : 'Participação em Vendas';

  let ytd = valor;
  if (cfg.id === '61' && historicoRca61) {
    const meses = historicoRca61.meses_disponiveis || [];
    const porSegmento = historicoRca61.porSegmento || {};
    ytd = meses.reduce((acc,m) => acc + (porSegmento[String(m)] || []).reduce((s,r) => s + Number(r.After_Tax_Amount || 0), 0), 0);
  }
  document.getElementById('kpiYtd').textContent = fmtBRL(ytd);
  document.getElementById('kpiLytd').textContent = cfg.id === '66' ? '—' : 'R$ 0,00';
  document.getElementById('kpiVariacao').textContent = cfg.id === '66' ? '—' : fmtBRL(ytd);
}

function renderizarHistorico() {
  const cfg = obterConfigRca();
  const id = 'chartHistoricoFaturamento';
  if (!cfg.temHistoricoMensal || !historicoRca61) {
    showChartNotice(id, 'RCA 66 não possui histórico mensal nesta base. A carteira é carregada pela planilha própria do RCA.');
    return;
  }
  restoreChartCanvas(id);
  const labels = (historicoRca61.meses_disponiveis || []).map(m => ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][m-1]);
  const vals = (historicoRca61.meses_disponiveis || []).map(m => (historicoRca61.porSegmento?.[String(m)] || []).reduce((s,r) => s + Number(r.After_Tax_Amount || 0), 0));
  destroyChart(id);
  charts[id] = new Chart(document.getElementById(id), {
    type:'line', data:{labels, datasets:[{label:'Faturamento',data:vals,tension:.25,fill:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true}},scales:{y:{ticks:{callback:v=>fmtBRL(v)}}}}
  });
}

function renderizarBudget() {
  const cfg = obterConfigRca();
  const id='chartBudget';
  if (cfg.id === '66') { showChartNotice(id,'RCA 66 não possui histórico mensal/budget nesta base.'); return; }
  restoreChartCanvas(id); destroyChart(id);
  charts[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels:['Dados disponíveis'],datasets:[{label:'Budget',data:[0]}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
}

function renderizarTipoEncomenda() {
  const cfg=obterConfigRca(); const id='chartTipoEncomenda';
  if(cfg.id==='66'){showChartNotice(id,'A planilha do RCA 66 não traz a série de tipo de encomenda.');return;}
  restoreChartCanvas(id); destroyChart(id);
  charts[id]=new Chart(document.getElementById(id),{type:'doughnut',data:{labels:['Dados de encomenda'],datasets:[{data:[1]}]},options:{responsive:true,maintainAspectRatio:false}});
}

function renderizarSegmentos() {
  const cfg=obterConfigRca(); const id='chartSegmentos';
  if(cfg.id==='66'){showChartNotice(id,'RCA 66 não possui histórico por segmento nesta base.');return;}
  restoreChartCanvas(id);
  const mes=document.getElementById('selectMes')?.value || 'ALL';
  const m=mes==='ALL' ? (historicoRca61?.meses_disponiveis || []).slice(-1)[0] : Number(mes);
  const rows=historicoRca61?.porSegmento?.[String(m)] || [];
  destroyChart(id);
  charts[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels:rows.map(r=>r.Separador),datasets:[{label:'Valor',data:rows.map(r=>Number(r.After_Tax_Amount||0))}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',scales:{x:{ticks:{callback:v=>fmtBRL(v)}}}}});
}

function renderizarProdutos() {
  const cfg=obterConfigRca(); const id='chartTopProdutos';
  if(cfg.id==='66'){showChartNotice(id,'A planilha do RCA 66 não possui histórico de produtos.');return;}
  restoreChartCanvas(id);
  const mes=document.getElementById('selectMes')?.value || 'ALL';
  const m=mes==='ALL' ? (historicoRca61?.meses_disponiveis || []).slice(-1)[0] : Number(mes);
  const rows=(historicoRca61?.porProduto?.[String(m)] || []).slice().sort((a,b)=>Number(b['Valor de Venda']||0)-Number(a['Valor de Venda']||0)).slice(0,20);
  destroyChart(id);
  charts[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels:rows.map(r=>r.Produto),datasets:[{label:'Valor',data:rows.map(r=>Number(r['Valor de Venda']||0))}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',scales:{x:{ticks:{callback:v=>fmtBRL(v)}}}}});
}

function renderizarTabelaVendas() {
  const tbody=document.getElementById('tbVendasCliente'); if(!tbody)return;
  const cfg=obterConfigRca();
  let rows=[];
  if(cfg.id==='61' && historicoRca61){
    const mes=document.getElementById('selectMes')?.value || 'ALL';
    const meses=mes==='ALL'?historicoRca61.meses_disponiveis:[Number(mes)];
    rows=meses.flatMap(m=>historicoRca61.porCliente?.[String(m)]||[]);
    const by={}; rows.forEach(r=>{const k=r.Cliente_Pai;by[k]=(by[k]||0)+Number(r['Valor de venda (R$)']||0);});
    rows=Object.entries(by).map(([k,v])=>({cliente:k.replace(/^\d+-/,''),valor:v})).sort((a,b)=>b.valor-a.valor).slice(0,100);
  } else {
    rows=clientesFiltrados().map(c=>({cliente:c.cliente,valor:Number(c.valor||0)})).sort((a,b)=>b.valor-a.valor).slice(0,100);
  }
  const total=rows.reduce((s,r)=>s+r.valor,0);
  tbody.innerHTML=rows.length?rows.map((r,i)=>`<tr><td>${i<10?'Top '+(i+1):'Carteira'}</td><td>${esc(r.cliente)}</td><td>${fmtBRL(r.valor)}</td><td>${total?fmtPct(r.valor/total):'0,0%'}</td></tr>`).join(''):'<tr><td colspan="4" class="empty-row">Nenhum dado disponível.</td></tr>';
}

function renderizarInatividade() {
  const tbody=document.getElementById('tbInatividade'); if(!tbody)return;
  const rows=clientesFiltrados().map(c=>({c,dias:diasDesdeUltimaVenda(c.ultimaVenda)})).sort((a,b)=>(b.dias??-1)-(a.dias??-1)).slice(0,100);
  tbody.innerHTML=rows.map(({c,dias})=>`<tr><td>${dias==null?'Sem data':dias>=90?'Inativo':dias>=60?'Atenção':'Ativo'}</td><td>${esc(c.cliente)}</td><td>${esc(c.ultimaVenda||'-')}</td><td>${dias==null?'-':dias}</td></tr>`).join('');
}

function renderizarDashboard() {
  atualizarCabecalhoDashboard();
  renderizarKpis();
  renderizarHistorico(); renderizarBudget(); renderizarTipoEncomenda(); renderizarSegmentos(); renderizarProdutos();
  renderizarTabelaVendas(); renderizarInatividade();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function configurarEventosDashboard() {
  ['selectCliente','selectAno','selectMes'].forEach(id=>{
    const el=document.getElementById(id); if(el)el.addEventListener('change',renderizarDashboard);
  });
  const search=document.getElementById('searchClientInput');
  if(search) search.addEventListener('input',()=>{
    const q=search.value.toLowerCase().trim();
    document.querySelectorAll('#tbVendasCliente tr').forEach(tr=>{tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none';});
  });
}

function configurarUploads(){
  const bind=(inputId,labelId,dropId,which)=>{
    const input=document.getElementById(inputId); const label=document.getElementById(labelId); const drop=document.getElementById(dropId);
    if(!input)return;
    input.addEventListener('change',async e=>{
      const file=e.target.files?.[0]; if(!file)return;
      label.textContent=file.name;
      try{
        const buf=await file.arrayBuffer();
        const wb=XLSX.read(new Uint8Array(buf),{type:'array',cellDates:true});
        if(which===1)dadosUpload1=wb; else dadosUpload2=wb;
        const badge=document.getElementById('badgeText'); if(badge)badge.textContent=`Planilha carregada — ${obterConfigRca().nome}`;
      }catch(err){console.error(err); label.textContent='Erro ao ler arquivo';}
    });
    if(drop){['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag-over');}));['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('drag-over');}));drop.addEventListener('drop',e=>{if(e.dataTransfer.files?.[0]){input.files=e.dataTransfer.files;input.dispatchEvent(new Event('change'));}});}
  };
  bind('fileInput1','labelFile1','dropZone1',1); bind('fileInput2','labelFile2','dropZone2',2);
}

document.addEventListener('DOMContentLoaded',async()=>{
  try{
    montarSeletorDashboard();
    await carregarBaseDashboard();
    preencherFiltroClientes();
    configurarEventosDashboard();
    configurarUploads();
    renderizarDashboard();
  }catch(err){
    console.error(err);
    const badge=document.getElementById('badgeText'); if(badge)badge.textContent='Erro ao carregar a base';
  }
});
