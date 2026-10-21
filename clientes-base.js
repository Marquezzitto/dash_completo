/* ============================================================
 * clientes-base.js — alterações e novos clientes da "Base & SLAs"
 *
 * Usado SOMENTE por clientes.html. Guarda apenas o que foi ALTERADO ou
 * CRIADO por você; os demais clientes continuam vindo dos arquivos .json
 * de sempre. Nenhuma outra página e nenhuma planilha da RCA é alterada.
 *
 * MODO DE ARMAZENAMENTO
 *  - URL_BASE vazia      -> "local": grava neste navegador (funciona já).
 *  - URL_BASE preenchida -> "planilha": grava numa planilha NOVA do Google
 *    chamada "Clientes" (via apps_script_clientes.gs), visível a todos.
 * ============================================================ */
(function (global) {
  'use strict';

  // >>> COLE AQUI a URL /exec do Apps Script da planilha "Clientes"
  //     (passo a passo no começo do arquivo apps_script_clientes.gs).
  const URL_BASE = 'https://script.google.com/macros/s/AKfycbzr8uRzRX9JHpM2HgHyKwdcR0BIHXCoOtFZmtl_JGxi1Nna6texq8l9yZ-wCAcucl1EAg/exec';

  const CHAVE_LOCAL = 'clientes_base_v1';          // modo local: registros
  const CHAVE_CACHE = 'clientes_base_cache_v1';    // modo planilha: última cópia lida
  const CAMPOS = ['cliente', 'fantasia', 'cnpj', 'cidade', 'uf', 'telefone', 'celular', 'telefone2', 'email', 'email2'];

  const estado = { registros: [], origem: '', erro: '', promessa: null };

  // ---------- utilitários ----------
  function norm(s) {
    return String(s === null || s === undefined ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase();
  }
  const apenasDigitos = v => String(v === null || v === undefined ? '' : v).replace(/\D/g, '');

  function formatarCnpj(v) {
    const d = apenasDigitos(v);
    return d.length === 14
      ? `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
      : String(v === null || v === undefined ? '' : v).trim();
  }

  function cnpjValido(v) {
    const d = apenasDigitos(v);
    if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
    const dv = base => {
      const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const r = base.split('').reduce((s, n, i) => s + Number(n) * pesos[i], 0) % 11;
      return r < 2 ? 0 : 11 - r;
    };
    const d1 = dv(d.slice(0, 12));
    const d2 = dv(d.slice(0, 12) + d1);
    return d1 === Number(d[12]) && d2 === Number(d[13]);
  }

  function emailValido(v) {
    return /^[^\s@;,|]+@[^\s@;,|]+\.[^\s@;,|]+$/.test(String(v || '').trim());
  }

  function limparRegistro(r) {
    r = r || {};
    const t = v => String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim();
    let alt = r.alterados;
    if (typeof alt === 'string') alt = alt.split(/[,;|]/);
    alt = (Array.isArray(alt) ? alt : []).map(s => String(s).trim()).filter(s => CAMPOS.includes(s));
    const codigo = apenasDigitos(r.codigo).replace(/^0+(?=\d)/, '');
    return {
      id: codigo,
      rca: t(r.rca) === '66' ? '66' : '61',
      codigo,
      cliente: t(r.cliente),
      fantasia: t(r.fantasia),
      cnpj: formatarCnpj(t(r.cnpj)),
      cidade: t(r.cidade),
      uf: t(r.uf).toUpperCase(),
      telefone: t(r.telefone),
      celular: t(r.celular),
      telefone2: t(r.telefone2),
      email: t(r.email),
      email2: t(r.email2),
      obs: String(r.obs === null || r.obs === undefined ? '' : r.obs).trim(),
      alterados: alt,
      atualizadoEm: t(r.atualizadoEm)
    };
  }

  // ---------- armazenamento local / cache ----------
  function lerChave(chave) {
    try {
      const raw = localStorage.getItem(chave);
      const lista = raw ? JSON.parse(raw) : null;
      return Array.isArray(lista) ? lista.map(limparRegistro).filter(r => r.codigo) : null;
    } catch (_) { return null; }
  }
  function gravarChave(chave, lista) {
    try { localStorage.setItem(chave, JSON.stringify(lista)); return true; } catch (_) { return false; }
  }

  async function http(url, opcoes, ms) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms || 12000);
    try { return await fetch(url, Object.assign({}, opcoes, { signal: ctl.signal })); }
    finally { clearTimeout(timer); }
  }

  // ---------- carregar / salvar ----------
  function carregar(forcar) {
    if (estado.promessa && !forcar) return estado.promessa;
    estado.promessa = (async () => {
      if (!URL_BASE) {
        estado.registros = lerChave(CHAVE_LOCAL) || [];
        estado.origem = 'local';
        estado.erro = '';
        return estado;
      }
      try {
        const res = await http(`${URL_BASE}?acao=listar`);
        const json = await res.json();
        if (!json.ok) throw new Error(json.erro || 'Falha ao listar');
        estado.registros = (json.registros || []).map(limparRegistro).filter(r => r.codigo);
        estado.origem = 'planilha';
        estado.erro = '';
        gravarChave(CHAVE_CACHE, estado.registros);
      } catch (e) {
        const cache = lerChave(CHAVE_CACHE);
        estado.registros = cache || [];
        estado.origem = cache ? 'cache' : 'erro';
        estado.erro = String((e && e.message) || e);
      }
      return estado;
    })();
    return estado.promessa;
  }

  async function salvar(registro) {
    const reg = limparRegistro(registro);
    reg.atualizadoEm = new Date().toISOString();
    let salvo = reg;
    if (URL_BASE) {
      const res = await http(URL_BASE, { method: 'POST', body: JSON.stringify({ acao: 'salvar', registro: reg }) }, 20000);
      const texto = await res.text();
      let json;
      try { json = JSON.parse(texto); }
      catch (_) { throw new Error('Resposta inválida do Apps Script. Confira se a URL termina em /exec e se o acesso é "Qualquer pessoa".'); }
      if (!json.ok) throw new Error(json.erro || 'Falha desconhecida');
      salvo = limparRegistro(json.registro || reg);
    }
    const i = estado.registros.findIndex(x => x.codigo === salvo.codigo);
    if (i >= 0) estado.registros[i] = salvo; else estado.registros.push(salvo);
    if (URL_BASE) gravarChave(CHAVE_CACHE, estado.registros);
    else if (!gravarChave(CHAVE_LOCAL, estado.registros)) throw new Error('Não consegui gravar neste navegador (armazenamento cheio ou bloqueado).');
    return salvo;
  }

  // ---------- regras de aplicação ----------
  const registroDo = codigo => estado.registros.find(r => r.codigo === String(codigo)) || null;

  // Campos que o registro realmente altera: os listados em "alterados"
  // (mesmo vazios = o usuário apagou) ou, se a lista estiver vazia
  // (linha digitada à mão na planilha), todos os campos preenchidos.
  function camposAplicaveis(reg) {
    const lista = reg.alterados.length ? reg.alterados : CAMPOS.filter(c => reg[c] !== '');
    const out = {};
    lista.forEach(c => { out[c] = reg[c]; });
    return out;
  }

  // Diferença entre o que está no formulário e o cadastro original (arquivo .json).
  // Compara já normalizado (espaços, CNPJ formatado, UF maiúscula; "-" = vazio).
  function normCampo(campo, valor) {
    let v = String(valor === null || valor === undefined ? '' : valor).replace(/\s+/g, ' ').trim();
    if (v === '-') v = '';
    if (campo === 'cnpj') v = formatarCnpj(v);
    if (campo === 'uf') v = v.toUpperCase();
    return v;
  }
  function diferencas(original, valores) {
    const o = original || {};
    return CAMPOS.filter(c => normCampo(c, valores[c]) !== normCampo(c, o[c]));
  }

  const unicos = lista => lista.filter((v, i, a) => v && a.indexOf(v) === i);

  function clienteNovoDoRegistro(reg) {
    const hoje = new Date().toLocaleDateString('pt-BR');
    return {
      codigo: Number(reg.codigo), cliente: reg.cliente, fantasia: reg.fantasia, cidade: reg.cidade, uf: reg.uf,
      cnpj: reg.cnpj, valor: 0, ultimaVenda: '-', status: 'NOVO', rank: 0, qtdNotas: 0, dataCadastro: hoje,
      cluster: 'Novo cadastro', ativoSite: '', ultimoAcessoSite: '',
      telefone: reg.telefone, celular: reg.celular, telefone2: reg.telefone2, email: reg.email, email2: reg.email2,
      telefones: unicos([reg.telefone, reg.celular, reg.telefone2]), telefonesExtras: reg.telefone2 ? [reg.telefone2] : [],
      emails: unicos([reg.email, reg.email2]), emailsExtras: reg.email2 ? [reg.email2] : [],
      obs: reg.obs, _novo: true
    };
  }

  /**
   * Aplica a base compartilhada sobre a lista original de clientes (.json) de uma RCA.
   * Devolve { lista, editados:Set, novos:Set } sem alterar a lista recebida.
   */
  function mesclarLista(listaBase, rca) {
    const mapa = new Map(estado.registros.map(r => [r.codigo, r]));
    const editados = new Set();
    const novos = new Set();
    const vistos = new Set();
    const lista = (listaBase || []).map(c => {
      const reg = mapa.get(String(c.codigo));
      vistos.add(String(c.codigo));
      if (!reg) return c;
      const clone = Object.assign({}, c, camposAplicaveis(reg));
      if (reg.obs) clone.obs = reg.obs;
      clone._editado = true;
      editados.add(Number(c.codigo));
      return clone;
    });
    estado.registros.forEach(reg => {
      if (reg.rca !== String(rca) || vistos.has(reg.codigo)) return;
      lista.push(clienteNovoDoRegistro(reg));
      novos.add(Number(reg.codigo));
    });
    return { lista, editados, novos };
  }

  async function aplicar(listaBase, rca) {
    await carregar();
    return Object.assign(mesclarLista(listaBase, rca), { origem: estado.origem, erro: estado.erro });
  }

  global.ClientesBase = {
    get modo() { return URL_BASE ? 'planilha' : 'local'; },
    get estado() { return estado; },
    CAMPOS, carregar, salvar, aplicar, mesclarLista, registroDo, diferencas,
    limparRegistro, formatarCnpj, cnpjValido, emailValido, apenasDigitos, norm
  };
})(window);
