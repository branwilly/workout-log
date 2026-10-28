# Workout Log (PWA)

Mobile-first Push/Pull/Legs logger. Plain HTML/CSS/JS, no build step, no dependencies.

- `index.html`, `style.css`, `app.js`, `plan.js` (the plan, how-tos, tips: edit here), `sw.js`, `manifest.webmanifest`, `icons/`
- `Code.gs`: Google Apps Script web app (doPost appends rows to the sheet, doGet is a health check)
- `SETUP.md`: the one-time setup steps
- `tools/make_icons.py`: regenerates the icons (Pillow). `tools/test.js`: headless test (needs `npm i --no-save jsdom`)

Host it anywhere that serves static files over HTTPS (GitHub Pages, Netlify, Cloudflare Pages), at the root or in a sub-path.
The Apps Script URL is entered in the app's Settings screen and stored in localStorage. It is not in the code, so there are no secrets in the repo.

## Motivation features (v1.1.0)
Weekly Mon-Fri dots + goal ring (5 sessions/week), "beat last time" targets, PR badges, a 15-minute version (counts as a session, logged with notes "15-min version"), a post-session summary, and a weekly streak (a week counts at 4 of 5). All computed on the phone from the logged history; the sheet columns are unchanged. The 15-minute tap itself is stored locally (`wl.mini`); the sets you log are synced as usual. Per-day 15-minute lifts are in `plan.js` (`mini`).

## Coach cards, demo videos and the Leg day primer (v1.2.0)
- Every exercise card has a collapsed **Coach card**: muscles, 3-6 step setup, three trainer cues, common mistakes and fixes, what it should feel like, breathing and tempo, easier/harder options, and a short **evidence** line with PubMed/DOI links.
- Evidence strength is labelled **Strong / Moderate / Limited / Coaching practice**. Where there is no direct study the card says "coaching practice" instead of citing something loosely related.
- **Watch demo** loads a YouTube video (youtube-nocookie) only when you tap it; nothing is downloaded, hosted or loaded on open, so the app works offline (only the video needs internet). Each card also has an **Open on YouTube** link and, where one exists, a second library link (ExRx animations, Muscle & Strength, Concept2).
- Wed (and Fri) show a **Leg day primer**: squat and hinge basics, rack and safety pins, starting weights, a 3-step warm-up, and the best demos.
- All the content lives in `coach.js`. Run `node tools/verify-links.js` (needs internet) to re-check every video (oEmbed title/channel/embeddable), PubMed page, DOI and library link. It confirms a video's title and channel and that it can be embedded; it cannot tell what the video shows.
- Not medical advice: stop on sharp pain and see a clinician.
