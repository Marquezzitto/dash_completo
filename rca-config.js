/* ============================================================
   CONFIGURAÇÃO CENTRAL DOS RCAs
   RCA 61 = carteira atual + histórico mensal
   RCA 66 = carteira própria, sem histórico mensal
   ============================================================ */

const RCA_CONFIG = {
  '61': {
    id: '61',
    nome: 'RCA 61',
    clientesJson: 'clientes.json',
    historicoJson: 'historico_fixo.json',
    eloJson: 'atendimento_elo.json',
    driveSpreadsheetId: '1yr12JeKO-5ipBrzbqrcWFnYXhkfkQvH7tkRicbcogps',
    eloMode: 'drive',
    temHistoricoMensal: true,
    temDadosEloComparativos: true,
    storageKey: 'rca61_dadosVivos',
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbw-s10eMg-8ajimxH3lK1vwo5dK_o43SLHtQa4H0sN5oHQ8VrewthA-iBxx32_RVfns/exec'
  },
  '66': {
    id: '66',
    nome: 'RCA 66',
    clientesJson: 'rca66_clientes.json',
    historicoJson: null,
    eloJson: 'rca66_atendimento_elo.json',
    // ID da planilha Google informada para o RCA 66.
    driveSpreadsheetId: '12ZoIQhoWn9MDPWqz-EiPMiafoL6MiB1DAmhDLB_AaLo',
    eloMode: 'apps-script',
    temHistoricoMensal: false,
    temDadosEloComparativos: false,
    storageKey: 'rca66_dadosVivos',
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzCO-yjaRfKZd-W56n1BbFTJbyQFJVZls-k3DyjESSDJVTwtKDfJV71PkQ91UUKrTsI/exec'
  }
};

const RCA_STORAGE_KEY = 'rcaSelecionado';

function obterRcaSelecionado() {
  const salvo = localStorage.getItem(RCA_STORAGE_KEY);
  return RCA_CONFIG[salvo] ? salvo : '61';
}

function obterConfigRca() {
  return RCA_CONFIG[obterRcaSelecionado()];
}

function definirRcaSelecionado(id) {
  if (!RCA_CONFIG[id]) return;
  localStorage.setItem(RCA_STORAGE_KEY, id);
  window.location.reload();
}

function normalizarNomeRca(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function instalarSeletorRca() {
  const config = obterConfigRca();
  document.querySelectorAll('[data-rca-title]').forEach(el => {
    el.textContent = config.nome;
  });
  document.querySelectorAll('[data-rca-selector]').forEach(select => {
    select.value = config.id;
    select.onchange = () => definirRcaSelecionado(select.value);
  });
}

function normalizarClienteRca(c) {
  const valor = c.valor != null ? c.valor : c.valorTotal;
  const ultimaVenda = c.ultimaVenda || c['Última Venda'] || '';
  const cidade = c.cidade || c.Cidade || '';
  const ufOriginal = c.uf || c.UF || '';
  const uf = normalizarNomeRca(ufOriginal) === 'SPI' ? 'SP' : ufOriginal;

  let slaDias = c.slaDias;
  if ((slaDias === undefined || slaDias === null || slaDias === '') && c.sla) {
    const m = String(c.sla).match(/D\+(\d+)/i);
    if (m) slaDias = Number(m[1]);
  }

  return {
    ...c,
    codigo: Number(c.codigo),
    cliente: String(c.cliente || '').trim(),
    fantasia: String(c.fantasia || '').trim(),
    cidade: String(cidade).trim(),
    uf: String(uf || '').trim(),
    cnpj: c.cnpj || '',
    email: c.email || '',
    telefone: c.telefone || '',
    celular: c.celular || '',
    valor: Number(valor || 0),
    ultimaVenda: String(ultimaVenda || ''),
    slaDias
  };
}

async function carregarClientesDaRca() {
  const config = obterConfigRca();
  const response = await fetch(config.clientesJson, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Não foi possível carregar ${config.clientesJson}`);
  const dados = await response.json();
  return Array.isArray(dados) ? dados.map(normalizarClienteRca) : [];
}

function criarSeletorRcaHtml() {
  const id = obterRcaSelecionado();
  return `
    <div class="filter-group rca-selector-group" title="Selecione a carteira/RCA">
      <span style="font-size:.72rem;color:#94a3b8;font-weight:700;">RCA</span>
      <select data-rca-selector aria-label="Selecionar RCA">
        <option value="61" ${id === '61' ? 'selected' : ''}>RCA 61</option>
        <option value="66" ${id === '66' ? 'selected' : ''}>RCA 66</option>
      </select>
    </div>`;
}

// SLA da carteira original. Para cidades novas do RCA 66 que não aparecem
// nesta relação, o sistema mostra "SLA não informado" em vez de inventar prazo.
const slaPorCidade = {
  "AMERICANA": "D+4", "AMPARO": "D+4", "ARACATUBA": "D+5", "ARACOIABA DA SERRA": "D+7",
  "ARTUR NOGUEIRA": "D+4", "ASSIS": "D+5", "ATIBAIA": "D+4", "BADY BASSITT": "D+4",
  "BARRETOS": "D+4", "BARUERI": "D+2", "BAURU": "D+4", "BOITUVA": "D+4", "BOTUCATU": "D+4",
  "BRODOWSKI": "D+4", "CACAPAVA": "D+6", "CAJAMAR": "D+2", "CAMPINAS": "D+3", "CONCHAS": "D+6",
  "COSMOPOLIS": "D+4", "CRAVINHOS": "D+4", "CUBATAO": "D+7", "DIADEMA": "D+1", "DRACENA": "D+7",
  "EMBU GUACU": "D+2", "FRANCA": "D+4", "GUARARAPES": "D+5", "GUARULHOS": "D+2", "HORTOLANDIA": "D+4",
  "IGUAPE": "D+6", "ILHA COMPRIDA": "D+6", "INDAIATUBA": "D+4", "ITAPEVI": "D+2", "ITAPIRA": "D+4",
  "ITU": "D+4", "JABOTICABAL": "D+4", "JANDIRA": "D+2", "JARDINOPOLIS": "D+4", "JARINU": "D+6",
  "JAU": "D+4", "JOSE BONIFACIO": "D+4", "JUNDIAI": "D+3", "LARANJAL PAULISTA": "D+4",
  "LENCOIS PAULISTA": "D+4", "LIMEIRA": "D+4", "LORENA": "D+3", "LOUVEIRA": "D+4", "MAIRIPORA": "D+2",
  "MARILIA": "D+4", "MATAO": "D+4", "MAUA": "D+1", "MOCOCA": "D+4", "MOGI DAS CRUZES": "D+1",
  "MOGI GUACU": "D+4", "MOGI MIRIM": "D+4", "MONTE MOR": "D+4", "ORLANDIA": "D+4", "OSASCO": "D+2",
  "PARAGUACU PAULISTA": "D+5", "PAULINIA": "D+4", "PIRACAIA": "D+7", "PIRACICABA": "D+4",
  "PORTO FERREIRA": "D+4", "POTIM": "D+3", "PRAIA GRANDE": "D+5", "PRESIDENTE PRUDENTE": "D+6",
  "RIBEIRAO PRETO": "D+4", "RIO CLARO": "D+4", "SANTA BARBARA D OESTE": "D+4", "SANTA ROSA DE VITERBO": "D+4",
  "SANTOS": "D+5", "SAO CARLOS": "D+4", "SAO JOAO DA BOA VISTA": "D+4", "SAO JOSE DO RIO PRETO": "D+4",
  "SAO JOSE DOS CAMPOS": "D+4", "SAO PAULO": "D+1", "SOROCABA": "D+4", "SUMARE": "D+4", "SUZANO": "D+1",
  "TATUI": "D+4", "TAUBATE": "D+4", "TUPA": "D+6", "VALINHOS": "D+4", "VARGEM GRANDE PAULISTA": "D+2",
  "VARZEA PAULISTA": "D+4", "VINHEDO": "D+4", "VOTORANTIM": "D+4"
};

const transportadoraPorCidade = {
  "AMERICANA":"Paulinéris", "AMPARO":"Paulinéris", "ARACATUBA":"Paulinéris", "ARACOIABA DA SERRA":"Paulinéris",
  "ARTUR NOGUEIRA":"Paulinéris", "ASSIS":"Paulinéris", "ATIBAIA":"Paulinéris", "BADY BASSITT":"Paulinéris",
  "BARRETOS":"Paulinéris", "BARUERI":"Barilog", "BAURU":"Paulinéris", "BOITUVA":"Paulinéris", "BOTUCATU":"Paulinéris",
  "BRODOWSKI":"Paulinéris", "CACAPAVA":"Paulinéris", "CAJAMAR":"Barilog", "CAMPINAS":"Paulinéris", "CONCHAS":"Paulinéris",
  "COSMOPOLIS":"Paulinéris", "CRAVINHOS":"Paulinéris", "CUBATAO":"Paulinéris", "DIADEMA":"Barilog", "DRACENA":"Paulinéris",
  "EMBU GUACU":"Barilog", "FRANCA":"Paulinéris", "GUARARAPES":"Paulinéris", "GUARULHOS":"Barilog", "HORTOLANDIA":"Paulinéris",
  "IGUAPE":"Paulinéris", "ILHA COMPRIDA":"Paulinéris", "INDAIATUBA":"Paulinéris", "ITAPEVI":"Barilog", "ITAPIRA":"Paulinéris",
  "ITU":"Paulinéris", "JABOTICABAL":"Paulinéris", "JANDIRA":"Barilog", "JARDINOPOLIS":"Paulinéris", "JARINU":"Paulinéris",
  "JAU":"Paulinéris", "JOSE BONIFACIO":"Paulinéris", "JUNDIAI":"Paulinéris", "LARANJAL PAULISTA":"Paulinéris",
  "LENCOIS PAULISTA":"Paulinéris", "LIMEIRA":"Paulinéris", "LORENA":"Paulinéris", "LOUVEIRA":"Paulinéris", "MAIRIPORA":"Barilog",
  "MARILIA":"Paulinéris", "MATAO":"Paulinéris", "MAUA":"Barilog", "MOCOCA":"Paulinéris", "MOGI DAS CRUZES":"Barilog",
  "MOGI GUACU":"Paulinéris", "MOGI MIRIM":"Paulinéris", "MONTE MOR":"Paulinéris", "ORLANDIA":"Paulinéris", "OSASCO":"Barilog",
  "PARAGUACU PAULISTA":"Paulinéris", "PAULINIA":"Paulinéris", "PIRACAIA":"Paulinéris", "PIRACICABA":"Paulinéris",
  "PORTO FERREIRA":"Paulinéris", "POTIM":"Paulinéris", "PRAIA GRANDE":"Paulinéris", "PRESIDENTE PRUDENTE":"Paulinéris",
  "RIBEIRAO PRETO":"Paulinéris", "RIO CLARO":"Paulinéris", "SANTA BARBARA D OESTE":"Paulinéris", "SANTA ROSA DE VITERBO":"Paulinéris",
  "SANTOS":"Paulinéris", "SAO CARLOS":"Paulinéris", "SAO JOAO DA BOA VISTA":"Paulinéris", "SAO JOSE DO RIO PRETO":"Paulinéris",
  "SAO JOSE DOS CAMPOS":"Paulinéris", "SAO PAULO":"Barilog", "SOROCABA":"Paulinéris", "SUMARE":"Paulinéris", "SUZANO":"Barilog",
  "TATUI":"Paulinéris", "TAUBATE":"Paulinéris", "TUPA":"Paulinéris", "VALINHOS":"Paulinéris", "VARGEM GRANDE PAULISTA":"Barilog",
  "VARZEA PAULISTA":"Paulinéris", "VINHEDO":"Paulinéris", "VOTORANTIM":"Paulinéris"
};

const regiaoPorCidade = {
  "SAO PAULO":"Capital de SP", "BARUERI":"Grande São Paulo", "CAJAMAR":"Grande São Paulo", "DIADEMA":"Grande São Paulo",
  "EMBU GUACU":"Grande São Paulo", "GUARULHOS":"Grande São Paulo", "ITAPEVI":"Grande São Paulo", "JANDIRA":"Grande São Paulo",
  "MAIRIPORA":"Grande São Paulo", "MAUA":"Grande São Paulo", "MOGI DAS CRUZES":"Grande São Paulo", "OSASCO":"Grande São Paulo",
  "SUZANO":"Grande São Paulo", "VARGEM GRANDE PAULISTA":"Grande São Paulo"
};

document.addEventListener('DOMContentLoaded', instalarSeletorRca);
