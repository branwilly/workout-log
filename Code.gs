/**
 * Workout Log - Google Apps Script (bound to the "Workout Log" Google Sheet).
 *
 * doPost(e): receives JSON (sent as text/plain so the browser skips the CORS
 *            preflight) and appends rows to the FIRST tab of the sheet.
 * doGet(e):  health check, returns JSON.
 *
 * Columns: timestamp | date | day | exercise | set number | weight | reps | notes
 * Bodyweight rows use exercise = "Bodyweight" (weight = body weight, set number = 1).
 *
 * Request body:
 *   { "action": "log", "replace": true,
 *     "rows": [ { "timestamp": "2026-10-26T07:12:03-04:00", "date": "2026-10-26",
 *                 "day": "Mon push", "exercise": "Incline dumbbell press",
 *                 "set": 1, "weight": 35, "reps": 10, "notes": "" } ] }
 *
 * With "replace": true any existing rows with the same date + exercise are
 * removed first, so re-saving an exercise (an edit, or a retry after a flaky
 * connection) never creates duplicates.
 */

var HEADERS = ['timestamp', 'date', 'day', 'exercise', 'set number', 'weight', 'reps', 'notes'];
var MAX_ROWS_PER_POST = 300;

function doGet(e) {
  var sh = getSheet_();
  return json_({
    ok: true,
    service: 'workout-log',
    sheet: SpreadsheetApp.getActiveSpreadsheet().getName(),
    tab: sh.getName(),
    dataRows: Math.max(0, sh.getLastRow() - 1),
    time: new Date().toISOString()
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    lock.waitLock(25000);
    locked = true;

    if (!e || !e.postData || !e.postData.contents) throw new Error('Empty request body');
    var body = JSON.parse(e.postData.contents);
    var rows = (body && body.rows) || [];
    if (!Array.isArray(rows)) throw new Error('"rows" must be an array');
    if (rows.length > MAX_ROWS_PER_POST) throw new Error('Too many rows in one request');

    var clean = [];
    for (var i = 0; i < rows.length; i++) clean.push(cleanRow_(rows[i]));

    var sh = getSheet_();
    var removed = 0;
    if (body.replace && clean.length) removed = removeExisting_(sh, clean);

    if (clean.length) {
      var start = sh.getLastRow() + 1;
      var range = sh.getRange(start, 1, clean.length, HEADERS.length);
      // Plain-text format on text columns so nothing is auto-converted (dates) or parsed as a formula.
      sh.getRange(start, 1, clean.length, 4).setNumberFormat('@');
      sh.getRange(start, 8, clean.length, 1).setNumberFormat('@');
      range.setValues(clean);
    }
    return json_({ ok: true, added: clean.length, replaced: removed });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (x) {} }
  }
}

/* ---------- helpers ---------- */

function getSheet_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var first = sh.getLastRow() > 0 ? String(sh.getRange(1, 1).getValue()) : '';
  if (first !== HEADERS[0]) {
    if (sh.getLastRow() > 0) sh.insertRowBefore(1);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function cleanRow_(r) {
  r = r || {};
  var date = String(r.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Bad date: ' + date);
  var exercise = String(r.exercise || '').trim().slice(0, 80);
  if (!exercise) throw new Error('Missing exercise');
  return [
    String(r.timestamp || new Date().toISOString()).slice(0, 40),
    date,
    String(r.day || '').slice(0, 40),
    exercise,
    num_(r.set),
    num_(r.weight),
    num_(r.reps),
    String(r.notes || '').slice(0, 500)
  ];
}

function num_(v) {
  if (v === '' || v === null || v === undefined) return '';
  var n = Number(v);
  return isFinite(n) ? n : '';
}

function dateStr_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v);
}

/* Delete existing rows whose (date, exercise) matches any incoming row. Returns count removed. */
function removeExisting_(sh, clean) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var keys = {};
  clean.forEach(function (r) { keys[r[1] + '|' + r[3]] = true; });
  var vals = sh.getRange(2, 1, last - 1, 4).getValues();
  var del = [];
  for (var i = 0; i < vals.length; i++) {
    if (keys[dateStr_(vals[i][1]) + '|' + String(vals[i][3])]) del.push(i + 2);
  }
  for (var j = del.length - 1; j >= 0; j--) sh.deleteRow(del[j]);
  return del.length;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
