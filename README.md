# Workout Log (PWA)

Mobile-first Push/Pull/Legs logger. Plain HTML/CSS/JS, no build step, no dependencies.

- `index.html`, `style.css`, `app.js`, `plan.js` (the plan, how-tos, tips: edit here), `sw.js`, `manifest.webmanifest`, `icons/`
- `Code.gs`: Google Apps Script web app (doPost appends rows to the sheet, doGet is a health check)
- `SETUP.md`: the one-time setup steps
- `tools/make_icons.py`: regenerates the icons (Pillow). `tools/test.js`: headless test (needs `npm i --no-save jsdom`)

Host it anywhere that serves static files over HTTPS (GitHub Pages, Netlify, Cloudflare Pages), at the root or in a sub-path.
The Apps Script URL is entered in the app's Settings screen and stored in localStorage. It is not in the code, so there are no secrets in the repo.
