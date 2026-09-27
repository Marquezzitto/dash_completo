// Regras de SLA compartilhadas entre RCA 61 e RCA 66.
// RCA 61: regras preservadas da sua clientes.html original.
// RCA 66: usa as mesmas regras quando a cidade é conhecida;
// cidades sem regra NÃO recebem prazo inventado.

const SLA_POR_CIDADE = {
  "AMERICANA": "D+4",
  "AMPARO": "D+4",
  "ARACATUBA": "D+5",
  "ARACOIABA DA SERRA": "D+7",
  "ARTUR NOGUEIRA": "D+4",
  "ASSIS": "D+5",
  "ATIBAIA": "D+4",
  "BADY BASSITT": "D+4",
  "BARRETOS": "D+4",
  "BARUERI": "D+2",
  "BAURU": "D+4",
  "BOITUVA": "D+4",
  "BOTUCATU": "D+4",
  "BRODOWSKI": "D+4",
  "CACAPAVA": "D+6",
  "CAJAMAR": "D+2",
  "CAMPINAS": "D+3",
  "CONCHAS": "D+6",
  "COSMOPOLIS": "D+4",
  "CRAVINHOS": "D+4",
  "CUBATAO": "D+7",
  "DRACENA": "D+7",
  "EMBU GUACU": "D+2",
  "FRANCA": "D+4",
  "GUARARAPES": "D+5",
  "GUARULHOS": "D+2",
  "HORTOLANDIA": "D+4",
  "IGUAPE": "D+6",
  "ILHA COMPRIDA": "D+6",
  "INDAIATUBA": "D+4",
  "ITAPEVI": "D+2",
  "ITAPIRA": "D+4",
  "ITU": "D+4",
  "JABOTICABAL": "D+4",
  "JANDIRA": "D+2",
  "JARDINOPOLIS": "D+4",
  "JARINU": "D+6",
  "JAU": "D+4",
  "JOSE BONIFACIO": "D+4",
  "JUNDIAI": "D+3",
  "LARANJAL PAULISTA": "D+4",
  "LENCOIS PAULISTA": "D+4",
  "LIMEIRA": "D+4",
  "LORENA": "D+3",
  "LOUVEIRA": "D+4",
  "MAIRIPORA": "D+2",
  "MARILIA": "D+4",
  "MATAO": "D+4",
  "MAUA": "D+1",
  "MOCOCA": "D+4",
  "MOGI DAS CRUZES": "D+1",
  "MOGI GUACU": "D+4",
  "MOGI MIRIM": "D+4",
  "MONTE MOR": "D+4",
  "ORLANDIA": "D+4",
  "OSASCO": "D+2",
  "PARAGUACU PAULISTA": "D+5",
  "PAULINIA": "D+4",
  "PIRACAIA": "D+7",
  "PIRACICABA": "D+4",
  "PORTO FERREIRA": "D+4",
  "POTIM": "D+3",
  "PRAIA GRANDE": "D+5",
  "PRESIDENTE PRUDENTE": "D+6",
  "RIBEIRAO PRETO": "D+4",
  "RIO CLARO": "D+4",
  "SANTA BARBARA D OESTE": "D+4",
  "SANTA ROSA DE VITERBO": "D+4",
  "SANTOS": "D+5",
  "SAO CARLOS": "D+4",
  "SAO JOAO DA BOA VISTA": "D+4",
  "SAO JOSE DO RIO PRETO": "D+4",
  "SAO JOSE DOS CAMPOS": "D+4",
  "SAO PAULO": "D+1",
  "SOROCABA": "D+4",
  "SUMARE": "D+4",
  "SUZANO": "D+1",
  "TATUI": "D+4",
  "TAUBATE": "D+4",
  "TUPA": "D+6",
  "VALINHOS": "D+4",
  "VARGEM GRANDE PAULISTA": "D+2",
  "VARZEA PAULISTA": "D+4",
  "VINHEDO": "D+4",
  "VOTORANTIM": "D+4",
  "DIADEMA": "D+1"
};
const TRANSPORTADORA_POR_CIDADE = {
  "AMERICANA": "Paulinéris",
  "AMPARO": "Paulinéris",
  "ARACATUBA": "Paulinéris",
  "ARACOIABA DA SERRA": "Paulinéris",
  "ARTUR NOGUEIRA": "Paulinéris",
  "ASSIS": "Paulinéris",
  "ATIBAIA": "Paulinéris",
  "BADY BASSITT": "Paulinéris",
  "BARRETOS": "Paulinéris",
  "BARUERI": "Barilog",
  "BAURU": "Paulinéris",
  "BOITUVA": "Paulinéris",
  "BOTUCATU": "Paulinéris",
  "BRODOWSKI": "Paulinéris",
  "CACAPAVA": "Paulinéris",
  "CAJAMAR": "Barilog",
  "CAMPINAS": "Paulinéris",
  "CONCHAS": "Paulinéris",
  "COSMOPOLIS": "Paulinéris",
  "CRAVINHOS": "Paulinéris",
  "CUBATAO": "Paulinéris",
  "DRACENA": "Paulinéris",
  "EMBU GUACU": "Barilog",
  "FRANCA": "Paulinéris",
  "GUARARAPES": "Paulinéris",
  "GUARULHOS": "Barilog",
  "HORTOLANDIA": "Paulinéris",
  "IGUAPE": "Paulinéris",
  "ILHA COMPRIDA": "Paulinéris",
  "INDAIATUBA": "Paulinéris",
  "ITAPEVI": "Barilog",
  "ITAPIRA": "Paulinéris",
  "ITU": "Paulinéris",
  "JABOTICABAL": "Paulinéris",
  "JANDIRA": "Barilog",
  "JARDINOPOLIS": "Paulinéris",
  "JARINU": "Paulinéris",
  "JAU": "Paulinéris",
  "JOSE BONIFACIO": "Paulinéris",
  "JUNDIAI": "Paulinéris",
  "LARANJAL PAULISTA": "Paulinéris",
  "LENCOIS PAULISTA": "Paulinéris",
  "LIMEIRA": "Paulinéris",
  "LORENA": "Paulinéris",
  "LOUVEIRA": "Paulinéris",
  "MAIRIPORA": "Barilog",
  "MARILIA": "Paulinéris",
  "MATAO": "Paulinéris",
  "MAUA": "Barilog",
  "MOCOCA": "Paulinéris",
  "MOGI DAS CRUZES": "Barilog",
  "MOGI GUACU": "Paulinéris",
  "MOGI MIRIM": "Paulinéris",
  "MONTE MOR": "Paulinéris",
  "ORLANDIA": "Paulinéris",
  "OSASCO": "Barilog",
  "PARAGUACU PAULISTA": "Paulinéris",
  "PAULINIA": "Paulinéris",
  "PIRACAIA": "Paulinéris",
  "PIRACICABA": "Paulinéris",
  "PORTO FERREIRA": "Paulinéris",
  "POTIM": "Paulinéris",
  "PRAIA GRANDE": "Paulinéris",
  "PRESIDENTE PRUDENTE": "Paulinéris",
  "RIBEIRAO PRETO": "Paulinéris",
  "RIO CLARO": "Paulinéris",
  "SANTA BARBARA D OESTE": "Paulinéris",
  "SANTA ROSA DE VITERBO": "Paulinéris",
  "SANTOS": "Paulinéris",
  "SAO CARLOS": "Paulinéris",
  "SAO JOAO DA BOA VISTA": "Paulinéris",
  "SAO JOSE DO RIO PRETO": "Paulinéris",
  "SAO JOSE DOS CAMPOS": "Paulinéris",
  "SAO PAULO": "Barilog",
  "SOROCABA": "Paulinéris",
  "SUMARE": "Paulinéris",
  "SUZANO": "Barilog",
  "TATUI": "Paulinéris",
  "TAUBATE": "Paulinéris",
  "TUPA": "Paulinéris",
  "VALINHOS": "Paulinéris",
  "VARGEM GRANDE PAULISTA": "Barilog",
  "VARZEA PAULISTA": "Paulinéris",
  "VINHEDO": "Paulinéris",
  "VOTORANTIM": "Paulinéris",
  "DIADEMA": "Barilog"
};
const REGIAO_POR_CIDADE = {
  "AMERICANA": "Interior de SP",
  "AMPARO": "Interior de SP",
  "ARACATUBA": "Interior de SP",
  "ARACOIABA DA SERRA": "Interior de SP",
  "ARTUR NOGUEIRA": "Interior de SP",
  "ASSIS": "Interior de SP",
  "ATIBAIA": "Interior de SP",
  "BADY BASSITT": "Interior de SP",
  "BARRETOS": "Interior de SP",
  "BARUERI": "Grande São Paulo",
  "BAURU": "Interior de SP",
  "BOITUVA": "Interior de SP",
  "BOTUCATU": "Interior de SP",
  "BRODOWSKI": "Interior de SP",
  "CACAPAVA": "Interior de SP",
  "CAJAMAR": "Grande São Paulo",
  "CAMPINAS": "Interior de SP",
  "CONCHAS": "Interior de SP",
  "COSMOPOLIS": "Interior de SP",
  "CRAVINHOS": "Interior de SP",
  "CUBATAO": "Interior de SP",
  "DRACENA": "Interior de SP",
  "EMBU GUACU": "Grande São Paulo",
  "FRANCA": "Interior de SP",
  "GUARARAPES": "Interior de SP",
  "GUARULHOS": "Grande São Paulo",
  "HORTOLANDIA": "Interior de SP",
  "IGUAPE": "Interior de SP",
  "ILHA COMPRIDA": "Interior de SP",
  "INDAIATUBA": "Interior de SP",
  "ITAPEVI": "Grande São Paulo",
  "ITAPIRA": "Interior de SP",
  "ITU": "Interior de SP",
  "JABOTICABAL": "Interior de SP",
  "JANDIRA": "Grande São Paulo",
  "JARDINOPOLIS": "Interior de SP",
  "JARINU": "Interior de SP",
  "JAU": "Interior de SP",
  "JOSE BONIFACIO": "Interior de SP",
  "JUNDIAI": "Interior de SP",
  "LARANJAL PAULISTA": "Interior de SP",
  "LENCOIS PAULISTA": "Interior de SP",
  "LIMEIRA": "Interior de SP",
  "LORENA": "Interior de SP",
  "LOUVEIRA": "Interior de SP",
  "MAIRIPORA": "Grande São Paulo",
  "MARILIA": "Interior de SP",
  "MATAO": "Interior de SP",
  "MAUA": "Grande São Paulo",
  "MOCOCA": "Interior de SP",
  "MOGI DAS CRUZES": "Grande São Paulo",
  "MOGI GUACU": "Interior de SP",
  "MOGI MIRIM": "Interior de SP",
  "MONTE MOR": "Interior de SP",
  "ORLANDIA": "Interior de SP",
  "OSASCO": "Grande São Paulo",
  "PARAGUACU PAULISTA": "Interior de SP",
  "PAULINIA": "Interior de SP",
  "PIRACAIA": "Interior de SP",
  "PIRACICABA": "Interior de SP",
  "PORTO FERREIRA": "Interior de SP",
  "POTIM": "Interior de SP",
  "PRAIA GRANDE": "Interior de SP",
  "PRESIDENTE PRUDENTE": "Interior de SP",
  "RIBEIRAO PRETO": "Interior de SP",
  "RIO CLARO": "Interior de SP",
  "SANTA BARBARA D OESTE": "Interior de SP",
  "SANTA ROSA DE VITERBO": "Interior de SP",
  "SANTOS": "Interior de SP",
  "SAO CARLOS": "Interior de SP",
  "SAO JOAO DA BOA VISTA": "Interior de SP",
  "SAO JOSE DO RIO PRETO": "Interior de SP",
  "SAO JOSE DOS CAMPOS": "Interior de SP",
  "SAO PAULO": "Capital de SP",
  "SOROCABA": "Interior de SP",
  "SUMARE": "Interior de SP",
  "SUZANO": "Grande São Paulo",
  "TATUI": "Interior de SP",
  "TAUBATE": "Interior de SP",
  "TUPA": "Interior de SP",
  "VALINHOS": "Interior de SP",
  "VARGEM GRANDE PAULISTA": "Grande São Paulo",
  "VARZEA PAULISTA": "Interior de SP",
  "VINHEDO": "Interior de SP",
  "VOTORANTIM": "Interior de SP",
  "DIADEMA": "Grande São Paulo"
};

const ALIASES_CIDADES_RCA66 = {
  "BERNARDINO DE C": "BERNARDINO DE CAMPOS",
  "CAMPO LIMPO PAU": "CAMPO LIMPO PAULISTA",
  "ENGENHEIRO COEL": "ENGENHEIRO COELHO",
  "FRANCISCO MORAT": "FRANCISCO MORATO",
  "LARANJAL PAULIS": "LARANJAL PAULISTA",
  "PRESIDENTE PRUD": "PRESIDENTE PRUDENTE",
  "SAO JOSE DO RIO": "SAO JOSE DO RIO PRETO",
  "SAO JOSE DOS CA": "SAO JOSE DOS CAMPOS",
  "SANTA BARBARA D": "SANTA BARBARA D OESTE",
  "SANTA ROSA DE V": "SANTA ROSA DE VITERBO",
  "SANTANA DE PARN": "SANTANA DE PARNAIBA"
};

function normalizarCidadeSLA(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolverCidadeSLA(cidade) {
  const n = normalizarCidadeSLA(cidade);
  const alias = ALIASES_CIDADES_RCA66[n];
  return alias || n;
}

function obterSLA(cidade, rca='61') {
  const chave = resolverCidadeSLA(cidade);
  return SLA_POR_CIDADE[chave] || null;
}

function obterTransportadora(cidade, rca='61') {
  const chave = resolverCidadeSLA(cidade);
  return TRANSPORTADORA_POR_CIDADE[chave] || null;
}

function obterRegiao(cidade, rca='61') {
  const chave = resolverCidadeSLA(cidade);
  return REGIAO_POR_CIDADE[chave] || null;
}

function calcularInfoSLA(cliente, rca='61') {
  const cidade = cliente?.cidade || '';
  const sla = obterSLA(cidade, rca);
  const transportadora = obterTransportadora(cidade, rca);
  const regiao = obterRegiao(cidade, rca);

  if (sla || transportadora || regiao) {
    return {
      sla: sla || 'SLA não informado',
      transportadora: transportadora || 'Transportadora não informada',
      regiao: regiao || (cliente?.uf === 'SP' ? 'Interior de SP' : 'Fora de SP'),
      informado: !!sla,
      fonte: rca === '66' ? 'Regra compartilhada da carteira' : 'Regra original RCA 61'
    };
  }

  // Se a base do cliente já tiver slaDias, preserve esse valor.
  if (cliente && cliente.slaDias !== undefined && cliente.slaDias !== null && cliente.slaDias !== '') {
    return {
      sla: `D+${cliente.slaDias}`,
      transportadora: 'Transportadora não informada',
      regiao: cliente.uf === 'SP' ? 'Interior de SP' : 'Fora de SP',
      informado: true,
      fonte: 'Base do cliente'
    };
  }

  return {
    sla: 'SLA não informado',
    transportadora: 'Não informado',
    regiao: cliente?.uf === 'SP' ? 'Interior de SP' : 'Fora de SP',
    informado: false,
    fonte: rca === '66' ? 'Cidade sem regra cadastrada para RCA 66' : 'Cidade sem regra cadastrada'
  };
}
