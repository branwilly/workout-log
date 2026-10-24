/* Headless sanity test (no browser): runs the real index.html + app.js in jsdom and Code.gs in a mocked
 * Apps Script runtime. Not needed to use the app.
 *   cd workout-app && npm i --no-save jsdom && node tools/test.js            */
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const tick = (ms = 20) => new Promise(r => setTimeout(r, ms));
let passed = 0;
const ok = (c, m) => { assert.ok(c, m); passed++; console.log('  ✓', m); };

async function boot(fetchImpl, pre) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url: 'https://example.test/workout-log/index.html', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  w.fetch = fetchImpl;
  w.scrollTo = () => {};
  w.confirm = () => true;
  if (pre) pre(w);
  w.eval(fs.readFileSync(path.join(root, 'plan.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(root, 'app.js'), 'utf8'));
  await tick();
  return w;
}
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const cards = w => [...w.document.querySelectorAll('section.card[data-ex]')];

(async () => {
  console.log('App (jsdom)');
  // --- no URL yet; fetch must not be called
  let calls = [];
  let mode = 'fail';
  const fakeFetch = (url, opts) => {
    calls.push({ url, opts });
    if (mode === 'fail') return Promise.reject(new TypeError('offline'));
    return Promise.resolve({ json: () => Promise.resolve({ ok: true, added: 1, replaced: 0, sheet: 'Workout Log', dataRows: 3 }) });
  };
  const w = await boot(fakeFetch);
  const A = w.WorkoutApp, D = w.document;
  const today = new Date(); const dow = today.getDay();
  ok(D.querySelector('h1').textContent === 'Today', 'opens on Today');
  const expected = { 1: 6, 2: 6, 3: 6, 4: 6, 5: 7 }[dow];
  if (expected) ok(cards(w).length === expected, `today's workout rendered (${cards(w).length} exercises)`);
  else ok(D.querySelector('.rest'), 'weekend shows rest card');

  // force each weekday and check counts + how-to presence
  const counts = { 1: 6, 2: 6, 3: 6, 4: 6, 5: 7 };
  for (const d of [1, 2, 3, 4, 5]) {
    A.state.dow = d; A.render();
    ok(cards(w).length === counts[d], `day ${d}: ${counts[d]} exercises`);
    ok(cards(w).every(c => c.querySelector('details summary')), `day ${d}: every exercise has how-to`);
  }
  A.state.dow = 1; A.render();
  const first = cards(w)[0];
  ok(first.querySelector('.name').textContent === 'Chest press machine' && first.querySelector('.target').textContent === '3 × 10', 'Mon: chest press machine 3 × 10');
  ok(cards(w)[4].querySelector('.target').textContent === '3 × 12 each arm', 'cable lateral raise shows "each arm"');
  ok(D.querySelector('.banner'), 'setup banner shown without URL');

  // --- save with no URL: stored locally first, queued, no network
  let inputs = first.querySelectorAll('.setrow input');
  inputs[0].value = '90'; inputs[0].dispatchEvent(new w.Event('input'));
  click(w, [...first.querySelectorAll('button.primary')][0]);
  await tick();
  ok(A.queue().length === 1 && calls.length === 0, 'save with no URL: queued locally, no network call');
  const hist = A.history()['Chest press machine'];
  ok(hist.length === 1 && hist[0].sets[0].w === 90, 'history stored locally');

  // --- URL set, network failing: stays queued
  w.localStorage.setItem(A.K.settings, JSON.stringify({ url: 'https://script.google.com/macros/s/TEST/exec' }));
  let r = await A.flush();
  ok(!r.ok && A.queue().length === 1 && calls.length === 1, 'failed post keeps item queued (will retry)');
  ok(/text\/plain/.test(calls[0].opts.headers['Content-Type']) && calls[0].opts.method === 'POST', 'POST is text/plain (no preflight)');
  const body = JSON.parse(calls[0].opts.body);
  ok(body.replace === true && body.rows.length === 3, 'payload has rows for 3 sets');
  const row = body.rows[0];
  ok(row.exercise === 'Chest press machine' && row.set === 1 && row.weight === 90 && row.reps === 10 && /^\d{4}-\d\d-\d\d$/.test(row.date) && row.day === 'Mon push' && /T\d\d:\d\d:\d\d[+-]\d\d:\d\d$/.test(row.timestamp), 'row has timestamp,date,day,exercise,set,weight,reps');
  // --- re-save same exercise replaces queue item (no dupes)
  A.state.dow = 1; A.render();
  click(w, [...cards(w)[0].querySelectorAll('button.primary')][0]);
  ok(A.queue().length === 1, 're-save replaces queued item');
  // --- network ok: queue drains
  mode = 'ok';
  await tick(50);
  r = await A.flush();
  ok(r.ok && A.queue().length === 0, 'flush succeeds and empties the queue');

  // --- prefill from last session
  const prev = new Date(today.getTime() - 7 * 864e5);
  const prevS = A.dateStr(prev);
  const hh = A.history(); hh['Incline dumbbell press'] = [{ date: prevS, ts: A.isoLocal(prev), day: 'Mon push', sets: [{ w: 35, r: 10 }, { w: 35, r: 10 }, { w: 35, r: 9 }], notes: '' }];
  w.localStorage.setItem(A.K.hist, JSON.stringify(hh));
  A.state.dow = 1; A.render();
  const inc = cards(w)[1];
  const vals = [...inc.querySelectorAll('.setrow input')].map(i => i.value);
  ok(vals.join(',') === '35,10,35,10,35,9', 'inputs pre-filled from last session: ' + vals.join(','));
  ok(/35×10\s+·\s+35×10\s+·\s+35×9/.test(inc.querySelector('.last').textContent), 'previous session shown');
  ok(inc.querySelectorAll('.setrow input.prefill').length === 6, 'prefilled inputs styled');

  // --- stepper buttons, add/remove set
  const plus = inc.querySelectorAll('.setrow .field button')[1];
  click(w, plus);
  ok(inc.querySelector('.setrow input').value === '37.5', 'weight + stepper adds 2.5');
  const btns = [...inc.querySelectorAll('.actions button')];
  click(w, btns[0]); ok(inc.querySelectorAll('.setrow').length === 4, '+ Set adds a row');
  click(w, btns[1]); ok(inc.querySelectorAll('.setrow').length === 3, '− Set removes a row');

  // --- bodyweight
  const bw = [...D.querySelectorAll('section.card')].find(c => c.querySelector('.name') && c.querySelector('.name').textContent === 'Bodyweight');
  bw.querySelector('input').value = '184.5';
  click(w, bw.querySelector('button.primary'));
  await tick();
  const bwRows = A.history()['Bodyweight'][0];
  ok(bwRows.sets[0].w === 184.5, 'bodyweight saved');
  ok(JSON.parse(calls[calls.length - 1].opts.body).rows[0].exercise === 'Bodyweight', 'bodyweight posted as exercise "Bodyweight"');

  // --- finisher
  const fin = [...D.querySelectorAll('section.card')].find(c => /stair stepper/i.test(c.textContent) && c.querySelector('.name') && /Extra time/.test(c.querySelector('.name').textContent));
  click(w, fin.querySelector('button.primary')); await tick();
  ok(A.history()['Stair stepper'][0].minutes === 10, 'finisher logged with default minutes');

  // --- progress chart
  const h2 = A.history(); const d1 = A.dateStr(new Date(today.getTime() - 14 * 864e5));
  h2['Incline dumbbell press'].unshift({ date: d1, ts: A.isoLocal(), day: 'Mon push', sets: [{ w: 30, r: 10 }], notes: '' });
  w.localStorage.setItem(A.K.hist, JSON.stringify(h2));
  A.state.pex = 'Incline dumbbell press';
  A.go('progress');
  ok(D.querySelector('svg.chart polyline') && D.querySelectorAll('svg.chart circle').length >= 2, 'progress shows SVG line chart with points');
  ok(D.querySelector('select option'), 'progress exercise picker');
  const top = A.topSet({ sets: [{ w: 30, r: 12 }, { w: 35, r: 8 }, { w: 35, r: 9 }] });
  ok(top.w === 35 && top.r === 9, 'top set = heaviest, then most reps');

  // --- settings validation + CSV
  A.go('settings');
  const url = D.querySelector('input[type=url]');
  url.value = 'https://evil.example/exec';
  click(w, [...D.querySelectorAll('button')].find(b => b.textContent === 'Save URL'));
  ok(JSON.parse(w.localStorage.getItem(A.K.settings)).url === 'https://script.google.com/macros/s/TEST/exec', 'rejects non-Apps-Script URL');
  const csv = A.toCSV(A.allRows());
  ok(csv.split('\n')[0] === 'timestamp,date,day,exercise,set number,weight,reps,notes' && csv.split('\n').length > 3, 'CSV export has header + rows');

  // --- weekend rest day
  const w2 = await boot(fakeFetch, win => {});
  w2.WorkoutApp.state.date = '2026-10-24'; w2.WorkoutApp.state.dow = null; w2.WorkoutApp.render();
  ok(w2.document.querySelector('.rest') && w2.document.querySelectorAll('section.card[data-ex]').length === 0, 'Saturday: rest card, chips available');
  ok(w2.document.querySelectorAll('.chip').length === 6, 'day chips (Mon-Fri + Rest) to pick a day');

  // --- static checks
  const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  ok(man.display === 'standalone' && man.icons.every(i => fs.existsSync(path.join(root, i.src))), 'manifest valid, icon files exist');
  ok(fs.existsSync(path.join(root, 'icons/apple-touch-icon.png')), 'apple-touch-icon exists');
  for (const f of ['index.html', 'style.css', 'plan.js', 'app.js', 'sw.js']) {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    ok(!/AKfycb|ghp_|gho_|api[_-]?key|secret/i.test(src), `${f}: no secrets`);
  }

  console.log('\nCode.gs (mock Apps Script)');
  const rowsStore = [['timestamp', 'date', 'day', 'exercise', 'set number', 'weight', 'reps', 'notes']];
  const sheet = {
    getName: () => 'Sheet1',
    getLastRow: () => rowsStore.length,
    getRange(r, c, nr = 1, nc = 1) {
      return {
        getValue: () => rowsStore[r - 1] ? rowsStore[r - 1][c - 1] : '',
        getValues: () => rowsStore.slice(r - 1, r - 1 + nr).map(x => x.slice(c - 1, c - 1 + nc)),
        setValues: v => { v.forEach((row, i) => { rowsStore[r - 1 + i] = row.slice(); }); return this; },
        setNumberFormat: () => ({}), setFontWeight() { return this; }
      };
    },
    deleteRow: n => rowsStore.splice(n - 1, 1), insertRowBefore() {}, setFrozenRows() {}
  };
  const sandbox = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheets: () => [sheet], getName: () => 'Workout Log' }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ s, setMimeType() { return this; }, getContent() { return this.s; } }) },
    Utilities: { formatDate: () => '2026-10-26' }, Session: { getScriptTimeZone: () => 'America/New_York' }, console
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'Code.gs'), 'utf8'), sandbox);
  const post = o => JSON.parse(sandbox.doPost({ postData: { contents: JSON.stringify(o) } }).getContent());
  const mk = (ex, n, wt, rp, date = '2026-10-26') => ({ timestamp: date + 'T07:10:00-04:00', date, day: 'Mon push', exercise: ex, set: n, weight: wt, reps: rp, notes: n === 1 ? '=1+1' : '' });
  let out = post({ action: 'log', replace: true, rows: [mk('Incline dumbbell press', 1, 35, 10), mk('Incline dumbbell press', 2, 35, 10), mk('Incline dumbbell press', 3, 35, 9)] });
  ok(out.ok && out.added === 3 && rowsStore.length === 4, 'doPost appends 3 rows');
  out = post({ action: 'log', replace: true, rows: [mk('Incline dumbbell press', 1, 40, 8), mk('Incline dumbbell press', 2, 40, 8)] });
  ok(out.ok && out.replaced === 3 && rowsStore.length === 3 && rowsStore[1][5] === 40, 'doPost replace: no duplicates on re-save/retry');
  out = post({ action: 'log', replace: true, rows: [mk('Bodyweight', 1, 184.5, '')] });
  ok(out.ok && rowsStore[3][3] === 'Bodyweight' && rowsStore[3][5] === 184.5 && rowsStore[3][6] === '', 'bodyweight row');
  out = post({ rows: [{ date: 'bad', exercise: 'x' }] });
  ok(out.ok === false && /Bad date/.test(out.error), 'doPost rejects bad rows with JSON error');
  out = JSON.parse(sandbox.doPost({}).getContent());
  ok(out.ok === false, 'doPost with empty body returns JSON error');
  const g = JSON.parse(sandbox.doGet({}).getContent());
  ok(g.ok === true && g.service === 'workout-log' && g.dataRows === 3, 'doGet health check');

  console.log(`\nAll ${passed} checks passed`);
  process.exit(0);
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
