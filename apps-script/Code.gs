/**
 * Kho chung cho PGNTT (Google Sheet + Apps Script).
 * - Tab "store": lưu dữ liệu, do ứng dụng tự quản lý.
 * - Tab "allow": danh sách Gmail được xem và ghi dữ liệu, mỗi email một dòng ở cột A (dòng 1 là tiêu đề).
 * - Thuộc tính tập lệnh: CLIENT_ID = Client ID OAuth (web).
 * Xem README.md để cài đặt.
 */
const STORE_SHEET = 'store';
const ALLOW_SHEET = 'allow';
const CHUNK = 45000; // mỗi ô tối đa 50.000 ký tự

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    const who = verifyToken_(req.idToken);
    if (!who.ok) return out({ ok: false, code: 'auth', error: who.error });
    if (!isAllowed_(who.email)) return out({ ok: false, code: 'forbidden', error: 'Email ' + who.email + ' chưa được cấp quyền' });
    const sh = getStore_();
    if (req.op === 'get') return out(Object.assign({ ok: true }, readDoc_(sh, req.doc)));
    if (req.op === 'set') { writeDoc_(sh, req.doc, req.body); return out({ ok: true }); }
    return out({ ok: false, error: 'Lệnh không hợp lệ' });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function verifyToken_(idToken) {
  if (!idToken) return { ok: false, error: 'Thiếu token đăng nhập' };
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return { ok: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' };
  const p = JSON.parse(r.getContentText());
  const clientId = PropertiesService.getScriptProperties().getProperty('CLIENT_ID');
  if (!clientId || p.aud !== clientId) return { ok: false, error: 'Sai Client ID' };
  if (String(p.email_verified) !== 'true') return { ok: false, error: 'Email chưa được xác minh' };
  return { ok: true, email: String(p.email).trim().toLowerCase() };
}

function isAllowed_(email) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ALLOW_SHEET);
  if (!sh || sh.getLastRow() < 2) return false;
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  return v.some(r => String(r[0]).trim().toLowerCase() === email);
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
  for (let i = 1; i < v.length; i++) {
    if (v[i][0] === doc) parts.push([Number(v[i][1]), String(v[i][3])]);
  }
  if (!parts.length) return { exists: false };
  parts.sort((a, b) => a[0] - b[0]);
  return { exists: true, data: JSON.parse(parts.map(p => p[1]).join('')) };
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
