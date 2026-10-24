# Workout Log: one-time setup (about 5 minutes)

Everything you log is saved on the phone first, then sent to the Google Sheet "Workout Log".
You only do this once.

## A. On your Mac (connect the sheet)
1. Open the **Workout Log** sheet in Google Sheets (signed in as yourself).
2. **Extensions > Apps Script**.
3. Select everything in the editor, delete it, and paste the full contents of **Code.gs** (the Google Drive file "Workout Log - Code.gs", or the Code.gs file in this folder). Press **Cmd+S**.
4. **Deploy > New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**. When asked, **Authorize access**, choose your account, then **Advanced > Go to (project name) (unsafe) > Allow**. (It is your own script; Google shows this warning for any unreviewed script.)
5. Copy the **Web app URL** (it ends in `/exec`).
6. Send that URL to your iPhone (AirDrop, Messages to yourself, or Notes).

## B. On your iPhone (install the app)
1. Open the app link in **Safari**, tap **Share > Add to Home Screen > Add**.
2. Open **Workouts** from the Home Screen (not Safari, it keeps its own storage).
3. Tap **Settings**, paste the URL, tap **Save URL**, then **Test**. You should see "Connected to Workout Log".

Done. Log a set and the status pill at the top should turn to "Synced".

## Notes
- If you edit Code.gs later: **Deploy > Manage deployments > pencil > Version: New version > Deploy** (the URL stays the same).
- Sheet columns: timestamp, date, day, exercise, set number, weight, reps, notes. Bodyweight rows have exercise "Bodyweight". Keep the data on the **first tab**.
- Re-saving an exercise on the same day replaces its rows (no duplicates). Offline saves wait on the phone and send automatically when you are back online.
