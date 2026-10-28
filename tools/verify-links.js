/* Re-checks every outside link in coach.js. Needs internet. Not part of the offline test run.
 *   node tools/verify-links.js
 * - YouTube: oEmbed must return 200 and the same title/channel stored in coach.js (embeddable).
 * - PubMed: page must load (200). DOI: must be registered (doi.org redirects). Some publishers block
 *   scripts after the redirect with 403, so a doi.org 3xx counts as resolved.
 * - Library links (ExRx, Muscle & Strength, Concept2, ...): page must load (200).
 * This can only confirm the title/channel and that a video is embeddable, not what the video shows. */
const PLAN = require('../coach.js');
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) workout-log-link-check' };
const jobs = [];
const add = (kind, label, url, okf, noFollow) => jobs.push({ kind, label, url, okf, noFollow });
for (const [id, v] of Object.entries(PLAN.VIDEOS)) {
  add('oembed', `${id} ${v.title}`, 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id),
    async r => { if (r.status !== 200) return 'status ' + r.status; const j = await r.json(); return j.title.trim() === v.title && j.author_name.trim() === v.src ? '' : `title/channel changed: "${j.title}" / ${j.author_name}`; });
}
for (const [k, r] of Object.entries(PLAN.REFS)) {
  add('pubmed', k, 'https://pubmed.ncbi.nlm.nih.gov/' + r.pmid + '/', async x => x.status === 200 ? '' : 'status ' + x.status);
  add('doi', k, 'https://doi.org/' + encodeURI(r.doi).replace(/</g, '%3C').replace(/>/g, '%3E'), async x => (x.status >= 300 && x.status < 400) ? '' : 'status ' + x.status, true);
}
const libs = new Set();
Object.values(PLAN.COACH).forEach(c => { if (c.lib) libs.add(c.lib.url); });
libs.forEach(u => add('library', u, u, async x => x.status === 200 ? '' : 'status ' + x.status));
(async () => {
  let bad = 0, n = 0;
  for (let i = 0; i < jobs.length; i += 6) {
    await Promise.all(jobs.slice(i, i + 6).map(async j => {
      let msg;
      try { const r = await fetch(j.url, { headers: UA, redirect: j.noFollow ? 'manual' : 'follow' }); msg = await j.okf(r); }
      catch (e) { msg = 'error ' + e.message; }
      n++; if (msg) { bad++; console.log('BAD ', j.kind, j.label, msg); }
    }));
  }
  console.log(`${n} links checked, ${bad} problems`);
  process.exit(bad ? 1 : 0);
})();
