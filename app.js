/* Workout Log - plain JS, no build step, no dependencies.
 *
 * Data flow for every save:
 *   1) write to localStorage (history + an outbox queue)   <- always first, works offline
 *   2) POST the queued rows to the Google Apps Script web app (text/plain JSON, no CORS preflight)
 *   3) on success remove from the queue; on failure keep it and retry (on load, when back online,
 *      when the app comes to the foreground, every 30s, or via the status pill / Settings > Sync now)
 * The Apps Script replaces rows with the same date + exercise, so retries and edits never duplicate.
 */
(function () {
  'use strict';

  /* ---- Config ---------------------------------------------------------------------------
   * Normally leave this empty: paste the Apps Script web-app URL once in Settings (stored in
   * localStorage). If you ever want it baked in, put the URL here instead. */
  var DEFAULT_SCRIPT_URL = '';
  var APP_VERSION = '1.0.0';
  var UNIT = 'lb';
  var URL_PATTERN = /^https:\/\/script\.google\.com\/.+\/exec$/;

  var K = { settings: 'wl.settings', hist: 'wl.history', queue: 'wl.queue', draft: 'wl.draft', checks: 'wl.checks', failed: 'wl.failed' };
  var PLAN = window.PLAN;
  var DAYNAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* ---- tiny helpers ------------------------------------------------------------------- */
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dateStr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function isoLocal(d) {
    d = d || new Date();
    var off = -d.getTimezoneOffset(), sign = off >= 0 ? '+' : '-', a = Math.abs(off);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + sign + pad(Math.floor(a / 60)) + ':' + pad(a % 60);
  }
  function parseDate(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dowOf(s) { return parseDate(s).getDay(); }
  function fmt(n) { if (n === '' || n == null) return '–'; return String(Math.round(n * 100) / 100); }
  function num(v) { if (v === '' || v == null) return ''; var n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : ''; }
  function prettyDate(s) { var d = parseDate(s); return DAYNAMES[d.getDay()] + ' ' + (d.getMonth() + 1) + '/' + d.getDate(); }
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---- state + storage ---------------------------------------------------------------- */
  var state = { tab: 'today', date: dateStr(), dow: null, pex: null, flushing: false, lastError: '' };

  function settings() { return LS.get(K.settings, {}); }
  function scriptUrl() { return (settings().url || DEFAULT_SCRIPT_URL || '').trim(); }
  function history() { return LS.get(K.hist, {}); }
  function queue() { return LS.get(K.queue, []); }
  function dayForDow(dow) { return PLAN.DAYS[dow] || null; }
  function defaultDow(date) { var d = dowOf(date); return PLAN.DAYS[d] ? d : 0; }
  function dayLabel(dow, date) {
    if (PLAN.DAYS[dow]) return PLAN.DAYS[dow].label;
    return DAYNAMES[dowOf(date)] + ' rest';
  }

  function entryOn(name, date) {
    var arr = history()[name] || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].date === date) return arr[i];
    return null;
  }
  function lastBefore(name, date) {
    var arr = history()[name] || [], best = null;
    for (var i = 0; i < arr.length; i++) if (arr[i].date < date) best = arr[i];
    return best;
  }
  function upsertEntry(name, entry) {
    var hist = history(), arr = (hist[name] || []).filter(function (e) { return e.date !== entry.date; });
    arr.push(entry);
    arr.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : (a.ts < b.ts ? -1 : 1); });
    hist[name] = arr;
    return LS.set(K.hist, hist);
  }
  function rowsFor(name, entry) {
    return entry.sets.map(function (s, i) {
      return { timestamp: entry.ts, date: entry.date, day: entry.day, exercise: name, set: i + 1, weight: s.w, reps: s.r, notes: i === 0 ? (entry.notes || '') : '' };
    });
  }
  function enqueue(name, entry) {
    var key = entry.date + '|' + name;
    var q = queue().filter(function (i) { return i.key !== key; });
    q.push({ key: key, queuedAt: Date.now() + '-' + Math.random().toString(36).slice(2, 6), fails: 0,
      payload: { action: 'log', replace: true, app: 'workout-log/' + APP_VERSION, rows: rowsFor(name, entry) } });
    return LS.set(K.queue, q);
  }
  /* Save locally FIRST, queue for the sheet, then try to send. */
  function saveEntry(name, entry) {
    var ok1 = upsertEntry(name, entry), ok2 = enqueue(name, entry);
    var d = LS.get(K.draft, {}); delete d[entry.date + '|' + name]; LS.set(K.draft, d);
    updateStatus();
    flush();
    return ok1 && ok2;
  }
  function topSet(entry) {
    var best = null;
    (entry.sets || []).forEach(function (s) {
      if (s.w === '' || s.w == null) return;
      if (!best || s.w > best.w || (s.w === best.w && (s.r || 0) > (best.r || 0))) best = { w: s.w, r: s.r };
    });
    return best;
  }

  /* ---- sync ------------------------------------------------------------------------------ */
  function post(url, payload) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 25000) : null;
    return fetch(url, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   /* simple request: no CORS preflight */
      body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined
    }).then(function (r) { return r.json(); }).then(function (j) { clearTimeout(timer); return j; },
      function (e) { clearTimeout(timer); throw e; });
  }
  function removeFromQueue(item) {
    var q = queue(), i = -1;
    for (var n = 0; n < q.length; n++) if (q[n].key === item.key && q[n].queuedAt === item.queuedAt) { i = n; break; }
    if (i >= 0) { q.splice(i, 1); LS.set(K.queue, q); }
  }
  function flush() {
    if (state.flushing) return Promise.resolve({ ok: false, busy: true });
    var url = scriptUrl();
    if (!url) { updateStatus(); return Promise.resolve({ ok: false, reason: 'nourl' }); }
    if (!queue().length) { state.lastError = ''; updateStatus(); return Promise.resolve({ ok: true, sent: 0 }); }
    state.flushing = true; updateStatus();
    var sent = 0;
    function step() {
      var q = queue();
      if (!q.length) return Promise.resolve(null);
      var item = q[0];
      return post(url, item.payload).then(function (res) {
        if (res && res.ok) { removeFromQueue(item); sent++; return step(); }
        /* Server answered but refused: after 5 refusals park it so it cannot block the queue. */
        var qq = queue(), cur = qq.filter(function (i) { return i.key === item.key; })[0];
        if (cur) {
          cur.fails = (cur.fails || 0) + 1;
          if (cur.fails >= 5) {
            var f = LS.get(K.failed, []); f.push({ key: cur.key, error: res && res.error, payload: cur.payload }); LS.set(K.failed, f);
            qq = qq.filter(function (i) { return i !== cur; }); LS.set(K.queue, qq);
            return step();
          }
          LS.set(K.queue, qq);
        }
        return (res && res.error) || 'The sheet script refused the data';
      }, function (e) {
        return (e && e.name === 'AbortError') ? 'Timed out' : 'No connection to the sheet script';
      });
    }
    return step().then(function (err) {
      state.flushing = false; state.lastError = err || '';
      updateStatus(); refreshBadges();
      return { ok: !err, sent: sent, error: err };
    }, function (e) {
      state.flushing = false; state.lastError = String(e && e.message || e);
      updateStatus(); return { ok: false, error: state.lastError };
    });
  }
  function syncInfo() {
    var n = queue().length, url = scriptUrl();
    if (!url) return { cls: 'warn', text: n ? 'Set up sync · ' + n + ' saved' : 'Set up sync' };
    if (state.flushing) return { cls: 'warn', text: 'Syncing…' };
    if (n) return state.lastError ? { cls: 'bad', text: '⚠ ' + n + ' waiting' } : { cls: 'warn', text: '⏳ ' + n + ' waiting' };
    return { cls: 'ok', text: '✓ Synced' };
  }
  function updateStatus() {
    var i = syncInfo();
    $$('.pill[data-sync]').forEach(function (p) { p.className = 'pill ' + i.cls; p.textContent = i.text; });
    var b = $('#sync-detail'); if (b) b.textContent = syncDetail();
  }
  function syncDetail() {
    var n = queue().length, f = LS.get(K.failed, []).length;
    var s = scriptUrl() ? (n ? n + ' save' + (n === 1 ? '' : 's') + ' waiting to send.' : 'Everything is in the sheet.') : 'No sheet URL yet. ' + n + ' save(s) are stored on this phone and will send once you add it.';
    if (state.lastError) s += ' Last problem: ' + state.lastError + '.';
    if (f) s += ' ' + f + ' item(s) were refused by the script.';
    return s;
  }
  function badgeInfo(key, saved) {
    if (!saved) return { cls: '', text: 'Not logged' };
    var queued = queue().some(function (i) { return i.key === key; });
    return queued ? { cls: 'warn', text: 'Saved · sending' } : { cls: 'ok', text: scriptUrl() ? 'Saved ✓ in sheet' : 'Saved on phone' };
  }
  function refreshBadges() {
    $$('.badge[data-key]').forEach(function (b) {
      if (b.getAttribute('data-edited')) return;
      var info = badgeInfo(b.getAttribute('data-key'), b.getAttribute('data-saved') === '1');
      b.className = 'badge ' + info.cls; b.textContent = info.text;
    });
  }

  /* ---- UI: shared pieces ------------------------------------------------------------------- */
  function syncPill() {
    var i = syncInfo();
    return h('button', { class: 'pill ' + i.cls, type: 'button', 'data-sync': '1', text: i.text, onclick: function () {
      if (!scriptUrl()) { go('settings'); return; }
      toast('Syncing…'); flush().then(function (r) { toast(r.ok ? 'Up to date' : (r.error || 'Could not sync')); });
    } });
  }
  function stepField(value, pre, step, min, label, onChange) {
    var input = h('input', { type: 'number', inputmode: 'decimal', step: 'any', min: '0', 'aria-label': label, value: value === '' || value == null ? '' : String(value), class: pre ? 'prefill' : '' });
    function changed() { input.classList.remove('prefill'); onChange(); }
    function bump(dir) {
      var cur = num(input.value); if (cur === '') cur = 0;
      var v = Math.max(min, Math.round((cur + dir * step) * 100) / 100);
      input.value = String(v); changed();
    }
    input.addEventListener('input', changed);
    var el = h('div', { class: 'field' },
      h('button', { type: 'button', 'aria-label': 'less ' + label, text: '−', onclick: function () { bump(-1); } }),
      input,
      h('button', { type: 'button', 'aria-label': 'more ' + label, text: '+', onclick: function () { bump(1); } }));
    return { el: el, input: input };
  }
  function howTo(name, extraTitle) {
    var g = PLAN.GUIDE[name];
    if (!g) return null;
    return h('details', null, h('summary', { text: extraTitle || 'How to + tip' }),
      h('p', { text: g.how }), h('p', { class: 'tip', text: 'Tip: ' + g.tip }));
  }

  /* ---- UI: exercise card ------------------------------------------------------------------ */
  function exerciseCard(lift, dow, date) {
    var name = lift[0], tSets = lift[1], tReps = lift[2], per = lift[3] || '';
    var key = date + '|' + name;
    var saved = entryOn(name, date);
    var last = lastBefore(name, date);
    var draft = LS.get(K.draft, {})[key];
    var rows = [];   /* [{w, r, pre}] */
    if (saved) rows = saved.sets.map(function (s) { return { w: s.w, r: s.r, pre: false }; });
    else if (draft) rows = draft.sets.map(function (s) { return { w: s.w, r: s.r, pre: false }; });
    else {
      for (var i = 0; i < tSets; i++) {
        var src = last ? (last.sets[i] || last.sets[last.sets.length - 1]) : null;
        rows.push(src ? { w: src.w, r: src.r, pre: true } : { w: '', r: tReps, pre: true });
      }
    }
    var notesVal = saved ? (saved.notes || '') : (draft ? draft.notes || '' : '');

    var card = h('section', { class: 'card' + (saved ? ' done' : ''), 'data-ex': name });
    var info = badgeInfo(key, !!saved);
    var badge = h('span', { class: 'badge ' + info.cls, 'data-key': key, 'data-saved': saved ? '1' : '0', text: info.text });
    card.appendChild(h('div', { class: 'row spread' },
      h('div', { class: 'grow' }, h('div', { class: 'name', text: name }),
        h('div', { class: 'target', text: tSets + ' × ' + tReps + (per ? ' ' + per : '') })), badge));
    var guide = howTo(name); if (guide) card.appendChild(guide);

    card.appendChild(h('div', { class: 'last' }, last
      ? [h('span', { text: 'Last time (' + prettyDate(last.date) + '): ' }),
         h('b', { text: last.sets.map(function (s) { return fmt(s.w) + '×' + fmt(s.r); }).join('  ·  ') })]
      : 'No previous session yet'));

    var setsEl = h('div', { class: 'sets' });
    var fields = [];
    function markEdited() {
      if (saved) { badge.setAttribute('data-edited', '1'); badge.className = 'badge warn'; badge.textContent = 'Edited · tap Save'; }
      var d = LS.get(K.draft, {}); d[key] = { sets: readSets(true), notes: notesInput.value }; LS.set(K.draft, d);
    }
    function addRow(v) {
      var n = fields.length + 1;
      var w = stepField(v.w, v.pre, 2.5, 0, 'weight set ' + n, markEdited);
      var r = stepField(v.r, v.pre, 1, 0, 'reps set ' + n, markEdited);
      fields.push({ w: w.input, r: r.input });
      setsEl.appendChild(h('div', { class: 'setrow' }, h('div', { class: 'setnum', text: 'Set ' + n }), w.el, r.el));
    }
    function readSets(keepEmpty) {
      var out = [];
      fields.forEach(function (f) {
        var w = num(f.w.value), r = num(f.r.value);
        if (keepEmpty || w !== '' || r !== '') out.push({ w: w, r: r });
      });
      return out;
    }
    var notesInput = h('input', { class: 'text notes', type: 'text', placeholder: 'Notes (optional)', value: notesVal, maxlength: '200', 'aria-label': 'notes for ' + name });
    notesInput.addEventListener('input', markEdited);
    card.appendChild(h('div', { class: 'colhead' }, h('span'), h('span', { text: 'Weight (' + UNIT + ')' }), h('span', { text: 'Reps' })));
    card.appendChild(setsEl);
    rows.forEach(addRow);
    card.appendChild(notesInput);

    var saveBtn = h('button', { class: 'btn primary', type: 'button', text: saved ? 'Update' : 'Save', onclick: function () {
      var sets = readSets(false);
      if (!sets.length) { toast('Enter at least one set'); return; }
      var entry = { date: date, ts: isoLocal(), day: dayLabel(dow, date), sets: sets, notes: notesInput.value.trim() };
      var ok = saveEntry(name, entry);
      toast(ok ? 'Saved' : 'Storage full or blocked, not saved!');
      card.replaceWith(exerciseCard(lift, dow, date));
    } });
    card.appendChild(h('div', { class: 'actions' },
      h('button', { class: 'btn small ghost', type: 'button', text: '+ Set', onclick: function () {
        var l = fields[fields.length - 1];
        addRow({ w: l ? num(l.w.value) : '', r: l ? num(l.r.value) : tReps, pre: true }); markEdited();
      } }),
      h('button', { class: 'btn small ghost', type: 'button', text: '− Set', onclick: function () {
        if (fields.length > 1) { fields.pop(); setsEl.removeChild(setsEl.lastChild); markEdited(); }
      } }),
      saveBtn));
    return card;
  }

  function finisherCard(fin, dow, date) {
    var name = fin.name, key = date + '|' + name;
    var saved = entryOn(name, date);
    var last = lastBefore(name, date);
    var mins = saved ? saved.minutes : (last ? last.minutes : fin.minutes);
    var info = badgeInfo(key, !!saved);
    var badge = h('span', { class: 'badge ' + info.cls, 'data-key': key, 'data-saved': saved ? '1' : '0', text: info.text });
    var m = stepField(mins, true, 1, 0, 'minutes', function () {});
    var card = h('section', { class: 'card' + (saved ? ' done' : '') },
      h('div', { class: 'row spread' }, h('div', { class: 'grow' }, h('div', { class: 'name', text: fin.label }),
        h('div', { class: 'target', text: 'Target ' + fin.minutes + ' min' })), badge),
      howTo(name),
      h('div', { class: 'last', text: last ? 'Last time (' + prettyDate(last.date) + '): ' + fmt(last.minutes) + ' min' : 'Minutes done' }),
      h('div', { class: 'setrow', style: 'grid-template-columns:44px 1fr;margin-top:8px' }, h('div', { class: 'setnum', text: 'Min' }), m.el),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', text: saved ? 'Update' : 'Log it', onclick: function () {
        var v = num(m.input.value);
        if (v === '' || v <= 0) { toast('Enter the minutes'); return; }
        saveEntry(name, { date: date, ts: isoLocal(), day: dayLabel(dow, date), sets: [{ w: '', r: '' }], minutes: v, notes: v + ' min' });
        toast('Saved'); card.replaceWith(finisherCard(fin, dow, date));
      } })));
    return card;
  }

  function checklistCard(title, items, idPrefix, date) {
    var checks = LS.get(K.checks, {}), day = checks[date] || {};
    var summary = h('summary', { text: '' });
    function count() { return items.filter(function (_, i) { return day[idPrefix + i]; }).length; }
    function refresh() { summary.textContent = title + ' · ' + count() + '/' + items.length; }
    var det = h('details', { class: 'card' });
    if (count() < items.length) det.setAttribute('open', '');
    det.appendChild(summary); refresh();
    items.forEach(function (text, i) {
      var cb = h('input', { type: 'checkbox', checked: !!day[idPrefix + i], 'aria-label': text });
      var lab = h('label', { class: 'check' + (day[idPrefix + i] ? ' on' : '') }, cb, h('span', { text: text }));
      cb.addEventListener('change', function () {
        var all = LS.get(K.checks, {}); all[date] = all[date] || {}; all[date][idPrefix + i] = cb.checked; day = all[date];
        var keep = Object.keys(all).sort().slice(-30), pruned = {}; keep.forEach(function (k) { pruned[k] = all[k]; });
        LS.set(K.checks, pruned); lab.classList.toggle('on', cb.checked); refresh();
      });
      det.appendChild(lab);
    });
    return det;
  }

  function bodyweightCard(date, dow) {
    var saved = entryOn('Bodyweight', date), last = lastBefore('Bodyweight', date);
    var cur = saved ? saved.sets[0].w : (last ? last.sets[0].w : '');
    var f = stepField(cur, !saved, 0.5, 0, 'bodyweight', function () {});
    var key = date + '|Bodyweight', info = badgeInfo(key, !!saved);
    var card = h('section', { class: 'card' },
      h('div', { class: 'row spread' }, h('div', { class: 'name', text: 'Bodyweight' }),
        h('span', { class: 'badge ' + info.cls, 'data-key': key, 'data-saved': saved ? '1' : '0', text: info.text })),
      h('div', { class: 'last', text: last ? 'Last (' + prettyDate(last.date) + '): ' + fmt(last.sets[0].w) + ' ' + UNIT : 'Quick entry, one per day' }),
      h('div', { class: 'row' }, h('div', { class: 'grow' }, f.el),
        h('button', { class: 'btn primary', style: 'width:auto;min-width:96px', type: 'button', text: saved ? 'Update' : 'Save', onclick: function () {
          var v = num(f.input.value);
          if (v === '' || v <= 0) { toast('Enter your weight'); return; }
          saveEntry('Bodyweight', { date: date, ts: isoLocal(), day: dayLabel(dow, date), sets: [{ w: v, r: '' }], notes: '' });
          toast('Saved'); card.replaceWith(bodyweightCard(date, dow));
        } })));
    return card;
  }

  /* ---- UI: Today ---------------------------------------------------------------------------- */
  function renderToday(root) {
    var date = state.date, dow = state.dow == null ? defaultDow(date) : state.dow;
    var realToday = dateStr();
    var day = dayForDow(dow);
    var dateInput = h('input', { type: 'date', class: 'text', value: date, 'aria-label': 'Workout date', style: 'width:auto;min-height:40px;margin-bottom:6px', onchange: function (e) {
      if (!e.target.value) return;
      state.date = e.target.value; state.dow = null; render();
    } });
    root.appendChild(h('div', { class: 'top' },
      h('div', null, h('h1', { text: date === realToday ? 'Today' : prettyDate(date) }),
        h('p', { class: 'sub', text: day ? day.title + ' · ' + day.label : (dowOf(date) === 0 || dowOf(date) === 6 ? 'Weekend: rest or pick a day' : 'Pick a day') })),
      syncPill()));
    root.appendChild(dateInput);

    if (!scriptUrl()) {
      root.appendChild(h('div', { class: 'banner' }, 'Sets are saved on this phone, but the Google Sheet is not connected yet. ',
        h('button', { type: 'button', text: 'Set up sync', onclick: function () { go('settings'); } })));
    }

    var chips = h('div', { class: 'chips', role: 'tablist' });
    [1, 2, 3, 4, 5].forEach(function (d) {
      var p = PLAN.DAYS[d];
      chips.appendChild(h('button', { type: 'button', class: 'chip' + (dow === d ? ' on' : '') + (dowOf(date) === d ? ' today' : ''), text: p.short + ' · ' + p.title.split(' ')[0],
        onclick: function () { state.dow = d; render(); } }));
    });
    chips.appendChild(h('button', { type: 'button', class: 'chip' + (dow === 0 ? ' on' : ''), text: 'Rest', onclick: function () { state.dow = 0; render(); } }));
    root.appendChild(chips);

    root.appendChild(bodyweightCard(date, dow));

    if (!day) {
      root.appendChild(h('section', { class: 'card rest' }, h('div', { class: 'big', text: '😴' }),
        h('div', { class: 'name', text: 'Rest day' }),
        h('p', { class: 'muted', text: 'Recover, walk, stretch. Tap a day above if you want to train anyway.' })));
      return;
    }
    root.appendChild(h('h2', { text: 'Warm-up' }));
    root.appendChild(checklistCard('Warm-up (5 min)', PLAN.WARMUP, 'w', date));
    root.appendChild(h('h2', { text: 'Lifting' }));
    day.lifts.forEach(function (lift) { root.appendChild(exerciseCard(lift, dow, date)); });
    root.appendChild(h('h2', { text: 'Finisher' }));
    root.appendChild(finisherCard(day.finisher, dow, date));
    root.appendChild(h('h2', { text: 'Cooldown' }));
    root.appendChild(checklistCard('Yoga cooldown (~10 min)', PLAN.COOLDOWN, 'c', date));
  }

  /* ---- UI: Progress (inline SVG, no libs) -------------------------------------------------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, text) {
    var el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (text != null) el.textContent = text;
    return el;
  }
  function niceStep(range) {
    var raw = range / 4, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  }
  function chartSVG(points) {
    var W = 340, H = 220, L = 40, R = 14, T = 14, B = 28;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img', 'aria-label': 'Top set weight over time' });
    var ys = points.map(function (p) { return p.y; });
    var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
    if (lo === hi) { lo -= 5; hi += 5; }
    var step = niceStep(hi - lo);
    lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    var t0 = points[0].x, t1 = points[points.length - 1].x;
    function X(t) { return points.length === 1 || t1 === t0 ? (L + W - R) / 2 : L + (t - t0) / (t1 - t0) * (W - L - R); }
    function Y(v) { return T + (hi - v) / (hi - lo) * (H - T - B); }
    for (var v = lo; v <= hi + 1e-9; v += step) {
      s.appendChild(svg('line', { class: 'grid', x1: L, x2: W - R, y1: Y(v), y2: Y(v) }));
      s.appendChild(svg('text', { x: L - 6, y: Y(v) + 3, 'text-anchor': 'end' }, String(Math.round(v * 100) / 100)));
    }
    s.appendChild(svg('text', { x: L, y: H - 8, 'text-anchor': 'start' }, points[0].label));
    if (points.length > 1) s.appendChild(svg('text', { x: W - R, y: H - 8, 'text-anchor': 'end' }, points[points.length - 1].label));
    if (points.length > 1) s.appendChild(svg('polyline', { class: 'line', points: points.map(function (p) { return X(p.x).toFixed(1) + ',' + Y(p.y).toFixed(1); }).join(' ') }));
    points.forEach(function (p) {
      var c = svg('circle', { class: 'dot', cx: X(p.x).toFixed(1), cy: Y(p.y).toFixed(1), r: 4 });
      c.appendChild(svg('title', {}, p.label + ': ' + p.y + ' ' + UNIT));
      s.appendChild(c);
    });
    return s;
  }
  function renderProgress(root) {
    var hist = history();
    var names = Object.keys(hist).filter(function (n) { return (hist[n] || []).some(function (e) { return topSet(e); }); });
    names.sort(function (a, b) { return a === 'Bodyweight' ? -1 : b === 'Bodyweight' ? 1 : hist[b].length - hist[a].length || (a < b ? -1 : 1); });
    root.appendChild(h('div', { class: 'top' }, h('div', null, h('h1', { text: 'Progress' }), h('p', { class: 'sub', text: 'Top-set weight per session' })), syncPill()));
    if (!names.length) {
      root.appendChild(h('section', { class: 'card rest' }, h('div', { class: 'big', text: '📈' }), h('p', { class: 'muted', text: 'Log a few sets and your charts will show up here.' })));
      return;
    }
    if (!state.pex || names.indexOf(state.pex) < 0) state.pex = names[0];
    var sel = h('select', { class: 'text', 'aria-label': 'Exercise', onchange: function (e) { state.pex = e.target.value; render(); } });
    names.forEach(function (n) { sel.appendChild(h('option', { value: n, text: n + ' (' + hist[n].length + ')', selected: n === state.pex })); });
    sel.value = state.pex;
    root.appendChild(sel);
    var sessions = hist[state.pex].filter(function (e) { return topSet(e); });
    var pts = sessions.map(function (e) { var d = parseDate(e.date); return { x: d.getTime(), y: topSet(e).w, label: (d.getMonth() + 1) + '/' + d.getDate() }; });
    var first = pts[0].y, latest = pts[pts.length - 1].y, best = Math.max.apply(null, pts.map(function (p) { return p.y; }));
    var diff = Math.round((latest - first) * 100) / 100;
    root.appendChild(h('section', { class: 'card' }, chartSVG(pts),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', { text: fmt(latest) }), h('span', { text: 'Latest ' + UNIT })),
        h('div', { class: 'stat' }, h('b', { text: fmt(best) }), h('span', { text: 'Best ' + UNIT })),
        h('div', { class: 'stat' }, h('b', { text: (diff > 0 ? '+' : '') + diff }), h('span', { text: 'Since first' })))));
    var tb = h('table', { class: 'hist' }, h('tr', null, h('th', { text: 'Date' }), h('th', { text: 'Sets' })));
    sessions.slice().reverse().slice(0, 12).forEach(function (e) {
      tb.appendChild(h('tr', null, h('td', { text: prettyDate(e.date) }),
        h('td', { text: e.sets.map(function (s) { return s.r === '' ? fmt(s.w) : fmt(s.w) + '×' + fmt(s.r); }).join('  ') })));
    });
    root.appendChild(h('h2', { text: 'Recent sessions' }));
    root.appendChild(h('section', { class: 'card' }, tb));
  }

  /* ---- UI: Settings ------------------------------------------------------------------------ */
  function allRows() {
    var hist = history(), rows = [];
    Object.keys(hist).forEach(function (n) { hist[n].forEach(function (e) { rows = rows.concat(rowsFor(n, e)); }); });
    rows.sort(function (a, b) { return a.timestamp < b.timestamp ? -1 : 1; });
    return rows;
  }
  function toCSV(rows) {
    var head = ['timestamp', 'date', 'day', 'exercise', 'set number', 'weight', 'reps', 'notes'];
    function q(v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    return [head.join(',')].concat(rows.map(function (r) { return [r.timestamp, r.date, r.day, r.exercise, r.set, r.weight, r.reps, r.notes].map(q).join(','); })).join('\n');
  }
  function renderSettings(root) {
    root.appendChild(h('div', { class: 'top' }, h('div', null, h('h1', { text: 'Settings' }), h('p', { class: 'sub', text: 'Google Sheet sync' })), syncPill()));
    var urlInput = h('input', { class: 'text', type: 'url', inputmode: 'url', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
      placeholder: 'https://script.google.com/macros/s/…/exec', value: settings().url || '', 'aria-label': 'Apps Script web app URL' });
    var result = h('p', { class: 'small muted', id: 'test-result', text: '' });
    function saveUrl() {
      var v = urlInput.value.trim();
      if (v && !URL_PATTERN.test(v)) { toast('That does not look like a web app URL (ends in /exec)'); return false; }
      var s = settings(); s.url = v; LS.set(K.settings, s); updateStatus(); return true;
    }
    root.appendChild(h('section', { class: 'card' },
      h('div', { class: 'name', text: 'Web app URL' }),
      h('p', { class: 'small muted', text: 'Paste the URL from Deploy > New deployment in Apps Script. You only do this once on this device.' }),
      urlInput,
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', text: 'Test', onclick: function () {
          if (!saveUrl()) return;
          var u = scriptUrl(); if (!u) { result.textContent = 'Paste the URL first.'; return; }
          result.textContent = 'Testing…';
          fetch(u, { method: 'GET', redirect: 'follow' }).then(function (r) { return r.json(); }).then(function (j) {
            result.textContent = j && j.ok ? '✓ Connected to "' + j.sheet + '" (' + j.dataRows + ' rows).' : 'The script answered but not as expected.';
          }, function () { result.textContent = '✕ Could not reach it. In Deploy, "Who has access" must be Anyone, and the URL must end in /exec.'; });
        } }),
        h('button', { class: 'btn primary', type: 'button', text: 'Save URL', onclick: function () {
          if (saveUrl()) { toast(scriptUrl() ? 'Saved. Sending waiting sets…' : 'URL cleared'); flush(); }
        } })),
      result));

    root.appendChild(h('h2', { text: 'Sync' }));
    root.appendChild(h('section', { class: 'card' },
      h('p', { id: 'sync-detail', text: syncDetail() }),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', text: 'Sync now', onclick: function () {
          if (!scriptUrl()) { toast('Add the URL first'); return; }
          toast('Syncing…'); flush().then(function (r) { toast(r.ok ? 'Up to date' : (r.error || 'Could not sync')); });
        } }),
        h('button', { class: 'btn ghost', type: 'button', text: 'Re-send all history', onclick: function () {
          if (!scriptUrl()) { toast('Add the URL first'); return; }
          if (!confirm('Send every logged set on this phone to the sheet again? Existing rows for the same exercise and date are replaced, so nothing is duplicated.')) return;
          var hist = history();
          Object.keys(hist).forEach(function (n) { hist[n].forEach(function (e) { enqueue(n, e); }); });
          updateStatus(); flush().then(function (r) { toast(r.ok ? 'All history sent' : (r.error || 'Will retry')); });
        } }))));

    var csv = toCSV(allRows());
    var box = h('textarea', { class: 'text', readonly: true, rows: '4', 'aria-label': 'Backup CSV', text: csv });
    root.appendChild(h('h2', { text: 'Backup' }));
    root.appendChild(h('section', { class: 'card' },
      h('p', { class: 'small muted', text: 'Everything you log lives on this phone and in the sheet. This is a CSV copy of the phone data.' }), box,
      h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', text: 'Copy CSV', onclick: function () {
        function legacy() { box.select(); try { document.execCommand('copy'); toast('Copied'); } catch (e) { toast('Select and copy manually'); } }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(csv).then(function () { toast('Copied'); }, legacy); else legacy();
      } }))));
    root.appendChild(h('p', { class: 'small muted', text: 'Workout Log v' + APP_VERSION + '. If you added this to your Home Screen, enter the URL inside the Home Screen app (it keeps its own storage, separate from Safari).' }));
  }

  /* ---- router ---------------------------------------------------------------------------------- */
  function render() {
    var root = $('#view'); if (!root) return;
    var y = window.scrollY;
    root.textContent = '';
    if (state.tab === 'progress') renderProgress(root);
    else if (state.tab === 'settings') renderSettings(root);
    else renderToday(root);
    $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === state.tab); });
    window.scrollTo(0, y);
  }
  function go(tab) { state.tab = tab; try { history_replace(tab); } catch (e) {} render(); window.scrollTo(0, 0); }
  function history_replace(tab) { if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + tab); }

  function init() {
    var hash = (location.hash || '').replace('#', '');
    if (hash === 'progress' || hash === 'settings') state.tab = hash;
    $$('#tabs button').forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-tab')); }); });
    render();
    if (navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) {} }
    window.addEventListener('online', flush);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        if (state.date !== dateStr() && state.tab === 'today' && state.dow == null) { state.date = dateStr(); render(); }
        flush();
      }
    });
    setInterval(function () { if (queue().length) flush(); }, 30000);
    flush();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  window.WorkoutApp = { state: state, K: K, flush: flush, saveEntry: saveEntry, rowsFor: rowsFor, topSet: topSet, toCSV: toCSV, allRows: allRows, queue: queue, history: history, render: render, dateStr: dateStr, isoLocal: isoLocal, go: go, scriptUrl: scriptUrl };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
