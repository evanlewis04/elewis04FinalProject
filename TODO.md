# TODO — Things You Still Need To Do

Everything in this list is something only you can do (account creation, secrets, deployment). Once these are done the app is ready to submit.

---

## 1. Install dependencies and run locally

```bash
npm install
cp .env.example .env   # on Windows: copy .env.example .env
```

Fill in `.env` with the values from steps 2 and 3, then:

```bash
npm start
```

Open <http://localhost:3000>. You should see the dashboard skeleton load even before MongoDB and Finnhub are wired up — but the quotes and forms will only work once those secrets are set.

---

## 2. Create a MongoDB Atlas database

The project description requires a **new** database user / connection string (do not reuse one from a class project).

1. Go to <https://cloud.mongodb.com> and log in (or create a free account).
2. Click **Build a Database** → choose the free **M0** shared cluster → pick a region close to you → **Create**.
3. Under **Security → Database Access**, click **Add new database user**:
   - Authentication: **Password**
   - Username: e.g. `ai_supply_chain_user`
   - Password: click **Autogenerate secure password** and copy it somewhere safe.
   - Role: **Read and write to any database**
   - Click **Add user**.
4. Under **Security → Network Access**, click **Add IP address** → **Allow access from anywhere** (`0.0.0.0/0`). This is needed so Render can connect.
5. Back on the cluster page, click **Connect → Drivers**:
   - Driver: **Node.js**, latest version
   - Copy the connection string. It looks like:

     ```
     mongodb+srv://ai_supply_chain_user:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password from step 3.
   - Add a database name before the `?` so Mongoose creates the right database. The final string should look like:

     ```
     mongodb+srv://ai_supply_chain_user:YOUR_PASSWORD@cluster0.xxxxxx.mongodb.net/ai_supply_chain?retryWrites=true&w=majority
     ```
6. Paste this string into your local `.env` file as `MONGODB_URI=...`.

---

## 3. Get a free Finnhub API key

1. Go to <https://finnhub.io/register> and sign up (free, no credit card).
2. After confirming your email, copy the API key from the dashboard.
3. Paste it into your local `.env` file as `FINNHUB_API_KEY=...`.

(The free tier gives 60 requests/minute, which is more than enough — the server caches every quote for 60 seconds.)

---

## 4. Push the project to GitHub

```bash
git add .
git commit -m "Initial AI supply chain dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-supply-chain-dashboard.git
git push -u origin main
```

(Skip the `git remote add` step if the remote already exists. The `.gitignore` already excludes `.env` and `node_modules/` — double-check that `.env` is **not** in the commit before pushing.)

---

## 5. Deploy to Render

1. Go to <https://render.com> and sign up / log in (the free plan is fine).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and select the repository you pushed in step 4.
4. Fill in the form:
   - **Name:** `ai-supply-chain-dashboard` (or whatever you want — this becomes the URL)
   - **Region:** any region near you
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
5. Scroll down to **Environment Variables** and add:
   - `MONGODB_URI` → the connection string from step 2
   - `FINNHUB_API_KEY` → the key from step 3
   - (Do **not** set `PORT` — Render injects it automatically.)
6. Click **Create Web Service**. The first deploy takes 2–3 minutes.
7. Once it finishes, your live URL will be `https://YOUR-SERVICE-NAME.onrender.com`.
8. Visit `/healthz` on that URL to confirm both MongoDB and Finnhub report `true`/`connected`.

> **Note:** Render's free tier spins down the service after ~15 minutes of inactivity. The first request after a sleep takes 30–60 seconds to wake up. This is fine for grading.

---

## 6. Record a YouTube demo video

The project description says **the project will not be graded without a YouTube demo video.**

What to show in the video (no audio required):
1. Open the live Render URL in a browser.
2. Scroll through the five layers — show the quotes loading from Finnhub.
3. Highlight the layer performance chart at the top.
4. Submit the **Add Analyst Note** form. Show the new note appearing in the feed below.
5. Submit the **Add to Watchlist** form (e.g. ticker `SMCI`, layer `Infrastructure`). Show the new card appearing in the watchlist with live quote data.
6. Refresh the page to prove the data persists in MongoDB.
7. (Optional) Open MongoDB Atlas → Browse Collections to show the `notes` and `watchlistitems` collections.

Upload the video to YouTube as **Unlisted** (so anyone with the link can view).

---

## 7. Update README.md

Open `README.md` and replace these placeholders with your real values:

- `https://www.youtube.com/REPLACE_WITH_YOUR_VIDEO` → the URL of the YouTube video you uploaded in step 6
- `https://REPLACE_WITH_RENDER_URL.onrender.com` → your live Render URL from step 5

If you end up working with group members, add their names + directory IDs to the `Group Members` line.

---

## 8. Submit to the submit server

The course submit server entry will open after the last regular project. When it does:

1. Make sure `node_modules/` is **not** in the project directory (it is already in `.gitignore`, so simply do not run `npm install` right before zipping, or delete the folder first).
2. Zip the entire `335 Final Project` folder.
3. Upload the zip via the submit server entry **Final Exam Project**.
4. Download the zip back from the submit server and verify all files are present (the description warns: missing files = -12 pts).

---

## Quick verification checklist before submitting

- [ ] `npm install && npm start` works locally with no errors.
- [ ] Dashboard loads at `http://localhost:3000` and quotes render.
- [ ] Submitting the **note** form persists to MongoDB (check Atlas).
- [ ] Submitting the **watchlist** form persists to MongoDB.
- [ ] Live Render URL works.
- [ ] `/healthz` on Render returns `mongo: connected` and `finnhub: true`.
- [ ] YouTube video is uploaded (Unlisted is fine) and the link is in `README.md`.
- [ ] `README.md` has your real Render URL, your real YouTube URL, and the correct contact info.
- [ ] `.env` is **not** committed to GitHub.
- [ ] `node_modules/` is **not** included in the submitted zip.
