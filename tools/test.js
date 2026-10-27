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

  // =====================================================================================
  console.log('\nMotivation features (fixed clock: Thu 2026-10-29 07:30)');
  const NOW = new Date(2026, 9, 29, 7, 30, 0).getTime();
  const fixClock = win => {
    const RD = win.Date;
    function FD(...a) { return a.length ? new RD(...a) : new RD(NOW); }
    FD.prototype = RD.prototype; FD.now = () => NOW; FD.UTC = RD.UTC; FD.parse = RD.parse;
    win.Date = FD;
  };
  const sess = (date, day, sets, notes = '') => ({ date, ts: date + 'T07:10:00-04:00', day, sets: sets.map(([w, r]) => ({ w, r })), notes });
  const seed = {
    // Mon 10/26 full push, Tue 10/27 only a 15-min tap (below), Wed 10/28 nothing
    'Chest press machine': [
      sess('2026-10-12', 'Mon push', [[80, 10], [80, 10], [80, 10]]),
      sess('2026-10-19', 'Mon push', [[85, 10], [85, 10], [85, 10]]),
      sess('2026-10-26', 'Mon push', [[90, 10], [90, 10], [90, 9]])
    ],
    'Seated cable row': [sess('2026-10-27', 'Tue pull', [[100, 12], [100, 12]], '15-min version')],
    'Bodyweight': [sess('2026-10-28', 'Wed legs', [[184, '']])],
    'Stair stepper': [Object.assign(sess('2026-10-28', 'Wed legs', [['', '']]), { minutes: 10 })]
  };
  const wm = await boot(fakeFetch, win => {
    fixClock(win);
    win.localStorage.setItem('wl.history', JSON.stringify(seed));
    win.localStorage.setItem('wl.mini', JSON.stringify({ '2026-10-27': { dow: 2 } }));
  });
  const M = wm.WorkoutApp, MD = wm.document;
  ok(M.dateStr() === '2026-10-29', 'clock fixed to Thu 2026-10-29');

  // 1. weekly dots + ring
  let wk = M.weekInfo('2026-10-29');
  ok(wk.start === '2026-10-26' && wk.days.map(d => d.status).join() === 'done,done,missed,today,upcoming', 'week dots: done, done, missed, today, upcoming');
  ok(wk.days[1].kind === 'mini' && wk.days[0].kind === 'full', 'Tue shows as 15-min, Mon as full');
  ok(wk.count === 2, 'Bodyweight and finisher alone do not count as a session (Wed stays empty)');
  ok(MD.querySelectorAll('.weekcard .dotd').length === 5 && MD.querySelector('.weekcard .dotd.today.now') && MD.querySelector('.weekcard .dotd.mini'), 'dots rendered on Today screen');
  ok(/2\s*of 5 sessions/.test(MD.querySelector('.weekcard .wk-count').textContent) && MD.querySelector('.weekcard svg.ring'), 'goal ring shows "2 of 5 sessions"');
  ok(!/miss|lost|fail|behind|streak (lost|broken)/i.test(MD.querySelector('.weekcard').textContent + [...MD.querySelectorAll('.dotd')].map(d => d.getAttribute('aria-label')).join(' ').replace(/no session/g, '')), 'no guilt language on the week card');
  ok(M.weekInfo('2026-11-01').start === '2026-10-26' && M.weekInfo('2026-11-02').start === '2026-11-02', 'weeks run Mon..Sun (Sunday belongs to the week before)');

  // 6. weekly streak
  let st = M.streakInfo('2026-10-29');
  ok(st.weeks === 0, 'streak 0 when the last week had < 4 sessions and this week has 2');
  const hs = {}; // build 3 prior weeks: 4,5,4 sessions + current week with 1 session (in-progress must not break streak)
  const addSess = (d) => { (hs['Back squat'] = hs['Back squat'] || []).push(sess(d, 'Wed legs', [[100, 8]])); };
  ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'].forEach(addSess);                                  // 4 (one skipped day)
  ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'].forEach(addSess);                    // 5
  ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22'].forEach(addSess);                                  // 4
  addSess('2026-10-26');                                                                                      // current week: 1 so far
  wm.localStorage.setItem('wl.history', JSON.stringify(hs)); wm.localStorage.setItem('wl.mini', '{}');
  st = M.streakInfo('2026-10-29');
  ok(st.weeks === 3 && st.best === 3, 'streak counts 3 weeks at >= 4 sessions; an in-progress week does not break it');
  addSess('2026-10-27'); addSess('2026-10-28'); addSess('2026-10-29');
  wm.localStorage.setItem('wl.history', JSON.stringify(hs));
  st = M.streakInfo('2026-10-29');
  ok(st.weeks === 4, 'current week joins the streak once it reaches 4');
  delete hs['Back squat'];
  ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-19', '2026-10-20'].forEach(addSess);
  wm.localStorage.setItem('wl.history', JSON.stringify(hs));
  st = M.streakInfo('2026-10-29');
  ok(st.weeks === 0 && st.best === 2, 'a week under 4 resets the current streak but "best" is remembered (2)');

  // back to the seeded data for the card-level tests
  wm.localStorage.setItem('wl.history', JSON.stringify(seed)); wm.localStorage.setItem('wl.mini', JSON.stringify({ '2026-10-27': { dow: 2 } }));
  M.state.date = '2026-10-29'; M.state.dow = 1; M.render();   // view a Mon-style push day on Thursday's date

  // 2. beat last time
  let t = M.suggestTarget('Chest press machine', 3, 10, '2026-10-29');
  ok(t.last.w === 90 && t.last.r === 10 && t.kind === 'rep' && t.w === 90 && t.r === 11, 'last time 90x10,90x10,90x9 (missed a rep) -> same weight, +1 rep: 90 x 11');
  seed['Chest press machine'][1] = sess('2026-10-19', 'Mon push', [[85, 10], [85, 10], [85, 9]]);
  seed['Chest press machine'][2] = sess('2026-10-26', 'Mon push', [[90, 10], [90, 10], [90, 10]]);
  wm.localStorage.setItem('wl.history', JSON.stringify(seed));
  t = M.suggestTarget('Chest press machine', 3, 10, '2026-10-29');
  ok(t.kind === 'rep' && t.w === 90 && t.r === 11, 'hit all reps last time but not the session before -> still +1 rep');
  seed['Chest press machine'][1] = sess('2026-10-19', 'Mon push', [[85, 10], [85, 11], [85, 10]]);
  wm.localStorage.setItem('wl.history', JSON.stringify(seed));
  t = M.suggestTarget('Chest press machine', 3, 10, '2026-10-29');
  ok(t.kind === 'weight' && t.w === 92.5 && t.r === 10, 'all target reps hit two sessions running -> smallest weight step: 92.5 x 10');
  ok(M.suggestTarget('Never done', 3, 10, '2026-10-29') === null, 'no history -> no target');
  M.render();
  const cp = cards(wm)[0];
  ok(/Top set last time\s*90 × 10/.test(cp.querySelector('.beat').textContent) && /Beat it:\s*92\.5 × 10/.test(cp.querySelector('.beat').textContent), 'exercise card shows last top set and the suggested target');
  ok(cards(wm)[1].querySelector('.beat') === null, 'exercise without history has no target line');

  // 3. PR badge + toast
  ok(M.prFor('Chest press machine', sess('2026-10-29', 'x', [[92.5, 8]])).type === 'weight', 'heavier than best weight is a PR');
  ok(M.prFor('Chest press machine', sess('2026-10-29', 'x', [[90, 11]])).type === 'reps', 'more reps at the same weight is a PR');
  ok(M.prFor('Chest press machine', sess('2026-10-29', 'x', [[90, 10], [85, 10]])) === null, 'tying the best is not a PR');
  ok(M.prFor('Chest press machine', sess('2026-10-29', 'x', [[87.5, 20]])) === null, 'new weight below your best with no weight record is not a PR');
  ok(M.prFor('Brand new lift', sess('2026-10-29', 'x', [[50, 10]])) === null, 'first ever log is a baseline, not a PR');
  ok(M.prFor('Chest press machine', sess('2026-10-12', 'x', [[80, 10]])) === null, 'an old day re-saved is not a PR (compared with other dates only, never itself)');
  let ins = cp.querySelectorAll('.setrow input');
  ins[0].value = '92.5'; ins[0].dispatchEvent(new wm.Event('input'));
  click(wm, cp.querySelector('button.primary'));
  ok(/PR/.test(MD.querySelector('#toast').textContent) && MD.querySelector('#toast').classList.contains('show'), 'PR toast on save');
  ok(MD.querySelector('section[data-ex="Chest press machine"] .badge.pr'), 'PR badge shown on the saved card');
  ok(!MD.querySelector('#summary'), 'summary does not open until the last exercise is saved');

  // 4. 15-minute version
  wm.localStorage.setItem('wl.history', JSON.stringify(seed)); wm.localStorage.setItem('wl.mini', JSON.stringify({ '2026-10-27': { dow: 2 } }));   // drop the PR-test save
  M.state.dow = 1; M.render();
  const miniBtn = MD.querySelector('.mini-btn');
  ok(miniBtn && /15-minute version/.test(miniBtn.textContent), '"Short on time? 15-minute version" button on Today');
  ok(JSON.stringify(M.miniLifts(wm.PLAN.DAYS[1]).map(l => l.slice(0, 2))) === JSON.stringify([['Chest press machine', 2], ['Seated dumbbell shoulder press', 2]]), 'mini session = 2 main lifts x 2 sets from the day plan');
  for (const d of [1, 2, 3, 4, 5]) { const ml = M.miniLifts(wm.PLAN.DAYS[d]); ok(ml.length === 2 && ml.every(l => wm.PLAN.DAYS[d].lifts.some(x => x[0] === l[0])), `day ${d}: mini lifts exist in the plan`); }
  const doneBefore = M.weekInfo('2026-10-29').count;
  M.state.date = '2026-10-29'; M.state.dow = 1; M.render();
  click(wm, MD.querySelector('.mini-btn'));
  ok(cards(wm).length === 2 && cards(wm).every(c => c.querySelector('.target').textContent.startsWith('2 × ')), 'mini view shows two exercise cards with 2 sets');
  ok(!MD.querySelector('.mini-btn') && /15-minute version/.test(MD.querySelector('.minibox').textContent) && !/Warm-up/.test(MD.querySelector('#view').textContent), 'mini view hides warm-up/finisher/cooldown and the button');
  ok(M.weekInfo('2026-10-29').count === doneBefore + 1 && MD.querySelector('.weekcard .dotd.done.mini.now'), 'tapping the 15-minute option counts the day (dot is half-filled)');
  ok(cards(wm)[0].querySelector('.notes').value === '15-min version', 'notes pre-filled with "15-min version"');
  // log both, check rows/notes, summary auto-opens after the last one
  calls.length = 0; mode = 'ok';
  wm.localStorage.setItem(M.K.settings, JSON.stringify({ url: 'https://script.google.com/macros/s/TEST/exec' }));
  const c1 = cards(wm)[0];
  c1.querySelectorAll('.setrow input')[0].value = '95'; c1.querySelectorAll('.setrow input')[0].dispatchEvent(new wm.Event('input'));
  click(wm, c1.querySelector('button.primary')); await tick(50);
  ok(!MD.querySelector('#summary'), 'no summary after only the first of two mini lifts');
  const posted = calls.map(c => JSON.parse(c.opts.body)).filter(b => b.rows[0].exercise === 'Chest press machine').pop();
  ok(posted && posted.rows.length === 2 && posted.rows[0].notes === '15-min version' && posted.rows[0].weight === 95, 'sheet row has notes "15-min version" (existing columns only)');
  ok(Object.keys(posted.rows[0]).sort().join() === 'date,day,exercise,notes,reps,set,timestamp,weight', 'row keys unchanged (no new sheet columns)');
  const c2 = cards(wm)[1];
  click(wm, c2.querySelector('button.primary')); await tick(50);
  const sm = MD.querySelector('#summary');
  ok(sm && /15-minute version done/.test(sm.textContent), 'summary opens after the last mini exercise is saved');

  // 5. summary content
  const sd = M.summaryData('2026-10-29', 1);
  ok(sd.sets === 4 && sd.kind === 'mini' && sd.lifts === 2, 'summary: sets done (4), kind mini');
  ok(sd.volume === 95 * 10 + 90 * 10, 'summary: volume = sum of weight x reps (95x10 + 90x10; reps-only sets add 0)');
  ok(sd.focus.tomorrow && sd.focus.label === 'Fri pull + legs' && sd.focus.lifts.length === 3, 'summary: tomorrow is Fri pull + legs focus with lifts');
  ok(/of 5 sessions this week/.test(sm.textContent) && sm.querySelector('.dots') && /Weekly streak/.test(sm.textContent), 'summary includes weekly progress + streak');
  ok(/Tomorrow/.test(sm.textContent) && sm.querySelector('.stats'), 'summary shows tomorrow + stats');
  click(wm, MD.querySelector('#summary-done'));
  ok(!MD.querySelector('#summary'), 'summary closes');
  // full-session summary compares against last same-day session, via Finish workout
  M.state.date = '2026-10-29'; M.state.dow = 1; wm.localStorage.setItem('wl.mini', '{}'); M.render();
  click(wm, MD.querySelector('#finish-workout'));
  const fs1 = MD.querySelector('#summary');
  ok(fs1 && /Workout done|15-minute version done/.test(fs1.textContent), 'Finish workout button opens the summary');
  const sd2 = M.summaryData('2026-10-29', 1);
  ok(sd2.kind === 'mini' && /isn.t compared/.test(fs1.textContent), '15-min day is not compared to full sessions');
  click(wm, MD.querySelector('#summary-done'));
  // full session volume vs last same-day
  const seed2 = JSON.parse(JSON.stringify(seed)); seed2['Chest press machine'].push(sess('2026-10-29', 'Mon push', [[95, 10], [95, 10], [95, 10]]));
  wm.localStorage.setItem('wl.history', JSON.stringify(seed2));
  const sd3 = M.summaryData('2026-10-29', 1);
  ok(sd3.kind === 'full' && sd3.prev && sd3.prev.date === '2026-10-26' && sd3.prev.volume === 2700 && sd3.volume === 2850 && sd3.prs.length === 1, 'summary: volume 2850 vs last same-day 2700, 1 PR');
  M.showSummary('2026-10-29', 1);
  ok(/2,700 lb \(\+6% today\)/.test(MD.querySelector('#summary').textContent) && /🏆/.test(MD.querySelector('#summary').textContent), 'summary shows volume vs last same-day session and the PR');
  click(wm, MD.querySelector('#summary-done'));
  ok(MD.querySelector('#finish-workout'), 'Finish workout button present on full view');

  // full workout: summary auto-opens when the last lift is saved
  const w5 = await boot(fakeFetch, win => { fixClock(win); });
  const M5 = w5.WorkoutApp; M5.state.date = '2026-10-29'; M5.state.dow = 4; M5.render();
  const n5 = cards(w5).length;
  for (let i = 0; i < n5; i++) {
    ok(!w5.document.querySelector('#summary'), `no summary before exercise ${i + 1}/${n5}`);
    click(w5, cards(w5)[i].querySelector('button.primary'));
  }
  ok(w5.document.querySelector('#summary') && /Workout done/.test(w5.document.querySelector('#summary').textContent), 'full workout: summary opens after the last exercise is saved');
  click(w5, w5.document.querySelector('#summary-done'));
  click(w5, cards(w5)[0].querySelector('button.primary'));
  ok(!w5.document.querySelector('#summary'), 'editing a saved exercise later does not re-open the summary');
  ok(M5.weekInfo('2026-10-29').days[3].status === 'done', 'logging a day marks its dot done');
  ok(fs.readFileSync(path.join(root, 'sw.js'), 'utf8').includes("workout-log-v2"), 'service worker cache bumped to workout-log-v2');

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
