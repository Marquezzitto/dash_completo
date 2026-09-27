/**
 * ===== Atendimento ELO RCA 66 — gravar edições feitas no site direto na planilha =====
 *
 * Mesma lógica do Apps Script do RCA 61, ajustada para a planilha do RCA 66.
 *
 * PLANILHA RCA 66:
 * 12ZoIQhoWn9MDPWqz-EiPMIAfoL6MiB1DAmhDLB_AaLo
 *
 * ABA DA CARTEIRA:
 * Minha Carteira
 *
 * CABEÇALHO:
 * linha 3
 *
 * Depois de alterar este código:
 * Gerenciar implantações > Editar > Nova versão > Implantar.
 */

const ID_DA_PLANILHA_RCA66 =
  '12ZoIQhoWn9MDPWqz-EiPMIAfoL6MiB1DAmhDLB_AaLo';

const NOME_DA_ABA = 'Minha Carteira';
const LINHA_DO_CABECALHO = 3;

function doPost(e) {
  const resultado = { ok: true, aplicadas: 0, erros: [] };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Nenhum dado foi recebido pelo Apps Script.');
    }

    const corpo = JSON.parse(e.postData.contents);
    const mudancas = corpo.mudancas || [];

    const planilha = SpreadsheetApp.openById(ID_DA_PLANILHA_RCA66);
    const aba = planilha.getSheetByName(NOME_DA_ABA);

    if (!aba) {
      throw new Error('Aba "' + NOME_DA_ABA + '" não encontrada.');
    }

    const dados = aba.getDataRange().getValues();
    const cabecalhos = dados[LINHA_DO_CABECALHO - 1];

    mudancas.forEach(function (m) {
      const colIndex = cabecalhos.indexOf(m.coluna);

      if (colIndex === -1) {
        resultado.erros.push('Coluna não encontrada: ' + m.coluna);
        return;
      }

      let linhaEncontrada = -1;

      for (let i = LINHA_DO_CABECALHO; i < dados.length; i++) {
        if (String(dados[i][0]) === String(m.codigo)) {
          linhaEncontrada = i;
          break;
        }
      }

      if (linhaEncontrada === -1) {
        resultado.erros.push('Cliente não encontrado: ' + m.codigo);
        return;
      }

      aba
        .getRange(linhaEncontrada + 1, colIndex + 1)
        .setValue(m.valor);

      resultado.aplicadas++;
    });

  } catch (err) {
    resultado.ok = false;
    resultado.erro = String(err);
  }

  return ContentService
    .createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      rca: '66',
      msg: 'Atendimento ELO RCA 66 — Apps Script ativo e no ar.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
