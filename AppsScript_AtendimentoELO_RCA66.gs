const SPREADSHEET_ID = '12ZoIQhoWn9MDPWqz-EiPMIAfoL6MiB1DAmhDLB_AaLo';
const SHEET_NAME = 'Atendimento ELO';
const CABECALHOS = ['Código','Cliente','SET contato','SET assunto','OUT contato','OUT assunto','NOV contato','NOV assunto','O que o cliente disse','Encaminhado para','Última atualização'];

function obterPlanilha(){ return SpreadsheetApp.openById(SPREADSHEET_ID); }

function obterAba(){
  const ss=obterPlanilha();
  let aba=ss.getSheetByName(SHEET_NAME);
  if(!aba) aba=ss.insertSheet(SHEET_NAME);
  prepararCabecalho(aba);
  return aba;
}

function prepararCabecalho(aba){
  if(aba.getLastRow()===0){
    aba.getRange(1,1,1,CABECALHOS.length).setValues([CABECALHOS]);
    formatarCabecalho(aba);
    return;
  }
  const atual=aba.getRange(1,1,1,CABECALHOS.length).getValues()[0];
  if(CABECALHOS.some((h,i)=>atual[i]!==h)){
    aba.getRange(1,1,1,CABECALHOS.length).setValues([CABECALHOS]);
    formatarCabecalho(aba);
  }
}

function formatarCabecalho(aba){
  aba.getRange(1,1,1,CABECALHOS.length).setFontWeight('bold').setHorizontalAlignment('center');
  aba.setFrozenRows(1);
  try{ aba.autoResizeColumns(1,CABECALHOS.length); }catch(e){}
}

function doGet(){
  try{
    const aba=obterAba();
    const ultima=aba.getLastRow();
    if(ultima<2) return respostaJSON({sucesso:true,rca:'66',dados:[]});
    const valores=aba.getRange(1,1,ultima,CABECALHOS.length).getValues();
    const dados=valores.slice(1).filter(r=>String(r[0]||'').trim()!=='').map(r=>{
      const obj={};
      valores[0].forEach((h,i)=>{
        let v=r[i];
        if(v instanceof Date) v=Utilities.formatDate(v,Session.getScriptTimeZone(),'dd/MM/yyyy HH:mm:ss');
        obj[h]=v;
      });
      return obj;
    });
    return respostaJSON({sucesso:true,rca:'66',dados:dados});
  }catch(erro){ return respostaJSON({sucesso:false,rca:'66',erro:String(erro)}); }
}

function doPost(e){
  try{
    if(!e || !e.postData || !e.postData.contents) return respostaJSON({sucesso:false,rca:'66',erro:'Nenhum conteúdo foi recebido.'});
    const payload=JSON.parse(e.postData.contents);
    if(payload.rca && String(payload.rca)!=='66') return respostaJSON({sucesso:false,rca:'66',erro:'Este Apps Script aceita somente o RCA 66.'});
    const aba=obterAba();
    let mudancas=payload.mudancas||{};
    if(payload.codigo!==undefined && typeof mudancas==='object' && !Array.isArray(mudancas)) mudancas={[String(payload.codigo)]:{...mudancas}};
    const codigos=Object.keys(mudancas);
    if(!codigos.length) return respostaJSON({sucesso:false,rca:'66',erro:'Nenhuma alteração foi enviada.'});

    const ultima=aba.getLastRow();
    const dados=ultima>=2?aba.getRange(2,1,ultima-1,CABECALHOS.length).getValues():[];
    const mapa={};
    dados.forEach((linha,i)=>{const c=normalizarCodigo(linha[0]);if(c) mapa[c]=i+2;});
    const resultados=[];

    codigos.forEach(codigoOriginal=>{
      const codigo=normalizarCodigo(codigoOriginal);
      const alteracoes=mudancas[codigoOriginal]||{};
      let linha=mapa[codigo];
      if(!linha){
        linha=aba.getLastRow()+1;
        aba.getRange(linha,1,1,CABECALHOS.length).setValues([[codigoOriginal,payload.cliente||alteracoes.cliente||'','','','','','','','','',new Date()]]);
        mapa[codigo]=linha;
      }
      const valores=aba.getRange(linha,1,1,CABECALHOS.length).getValues()[0];
      Object.keys(alteracoes).forEach(campo=>{
        const idx=CABECALHOS.indexOf(campo);
        if(idx>=0) valores[idx]=alteracoes[campo];
      });
      if(payload.cliente && !valores[1]) valores[1]=payload.cliente;
      valores[10]=new Date();
      aba.getRange(linha,1,1,CABECALHOS.length).setValues([valores]);
      resultados.push({codigo:codigoOriginal,linha:linha,atualizado:true});
    });
    return respostaJSON({sucesso:true,rca:'66',mensagem:'Atendimento salvo diretamente na planilha do RCA 66.',resultados:resultados});
  }catch(erro){ return respostaJSON({sucesso:false,rca:'66',erro:String(erro)}); }
}

function normalizarCodigo(valor){ if(valor===null||valor===undefined)return ''; return String(valor).trim().replace(/\.0$/,''); }
function respostaJSON(objeto){ return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON); }
function testarAcessoRCA66(){ const ss=obterPlanilha(); const aba=obterAba(); Logger.log('Planilha: '+ss.getName()); Logger.log('Aba: '+aba.getName()); Logger.log('ID: '+SPREADSHEET_ID); }
function testarGravacaoRCA66(){ const aba=obterAba(); const linha=aba.getLastRow()+1; aba.getRange(linha,1,1,CABECALHOS.length).setValues([['TESTE-RCA66','TESTE RCA 66','Teste','Teste de gravação','','','','','Registro criado pelo teste do Apps Script.','Teste',new Date()]]); Logger.log('Teste criado na linha '+linha); }
