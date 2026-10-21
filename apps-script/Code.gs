/**
 * Kho chung cho PGNTT: lưu từng khối dữ liệu (data/master, bg/master, ck/master...) vào tab "store" của Google Sheet.
 * Cài đặt: xem README.md mục "Cài Google Sheet".
 */
const STORE_SHEET = 'store';
const CHUNK = 45000; // mỗi ô tối đa 50.000 ký tự, để dư chỗ

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    const key = PropertiesService.getScriptProperties().getProperty('KEY');
    if (!key || req.key !== key) return out({ ok: false, error: 'Sai khoá truy cập' });
    const sh = getStore_();
    if (req.op === 'get') return out(Object.assign({ ok: true }, readDoc_(sh, req.doc)));
    if (req.op === 'set') { writeDoc_(sh, req.doc, req.body); return out({ ok: true }); }
    return out({ ok: false, error: 'Lệnh không hợp lệ' });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function getStore_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(STORE_SHEET);
  if (!sh) {
    sh = ss.insertSheet(STORE_SHEET);
    sh.getRange(1, 1, 1, 4).setValues([['doc', 'idx', 'at', 'text']]).setFontWeight('bold');
    sh.getRange('D:D').setNumberFormat('@');
  }
  return sh;
}

function readDoc_(sh, doc) {
  const v = sh.getDataRange().getValues();
  const parts = [];
  let at = '';
  for (let i = 1; i < v.length; i++) {
    if (v[i][0] === doc) { parts.push([Number(v[i][1]), String(v[i][3])]); at = String(v[i][2]); }
  }
  if (!parts.length) return { exists: false };
  parts.sort((a, b) => a[0] - b[0]);
  const json = parts.map(p => p[1]).join('');
  return { exists: true, data: JSON.parse(json) };
}

function writeDoc_(sh, doc, body) {
  const payload = JSON.stringify(body);
  const at = new Date().toISOString();
  const v = sh.getDataRange().getValues();
  for (let i = v.length - 1; i >= 1; i--) {
    if (v[i][0] === doc) sh.deleteRow(i + 1);
  }
  const rows = [];
  for (let i = 0, n = 0; i < payload.length; i += CHUNK, n++) {
    rows.push([doc, n, at, payload.slice(i, i + CHUNK)]);
  }
  if (rows.length) {
    const start = sh.getLastRow() + 1;
    sh.getRange(start, 4, rows.length, 1).setNumberFormat('@');
    sh.getRange(start, 1, rows.length, 4).setValues(rows);
  }
}
