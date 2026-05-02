# College Content Tool

A minimal full-stack web app for college content teams.
Input raw event details → get structured poster content + social media captions.

**Stack:** React (Vite) · Vercel Serverless Functions · OpenAI GPT-4o mini

---

## Project Structure

```
college-content-tool/
├── api/
│   └── generateContent.js     ← Serverless function (runs on Vercel, calls OpenAI)
├── src/
│   ├── main.jsx               ← React entry point
│   ├── App.jsx                ← Root component + fetch logic
│   ├── styles.css             ← All styles
│   └── components/
│       ├── InputPanel.jsx     ← Panel 1: raw input + mode toggle
│       ├── PosterPanel.jsx    ← Panel 2: poster fields
│       ├── MediaPanel.jsx     ← Panel 3: social media captions
│       └── CopyButton.jsx     ← Reusable copy-to-clipboard button
├── index.html
├── vite.config.js
├── vercel.json                ← Vercel build config
├── package.json
├── .env.example               ← Copy to .env.local for local dev
└── .gitignore
```

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variable

```bash
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key
```

### 3. Run locally

**Option A — Vercel CLI (recommended, runs API functions too)**

```bash
npm install -g vercel
vercel dev
```

Open http://localhost:3000

**Option B — Vite only (frontend only, API calls will fail)**

```bash
npm run dev
```

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
vercel
# Follow prompts to link/create project
```

Then add your environment variable:

```bash
vercel env add OPENAI_API_KEY
# Paste your key when prompted, select all environments
```

Deploy to production:

```bash
vercel --prod
```

### Option B — Vercel Dashboard (easiest)

1. Push this project to a GitHub repo
2. Go to https://vercel.com/new → Import your repo
3. Vercel auto-detects Vite — no config needed
4. Go to **Project Settings → Environment Variables**
5. Add `OPENAI_API_KEY` with your OpenAI key
6. Click **Redeploy**

Your app is live at `https://your-project.vercel.app`

---

## How It Works

```
User types raw text
       ↓
React frontend (Vite, /src)
       ↓  POST /api/generateContent
Vercel Serverless Function (/api/generateContent.js)
       ↓  reads OPENAI_API_KEY from env
OpenAI API (gpt-4o-mini)
       ↓  returns JSON
Frontend renders Poster + Media panels
```

Vercel automatically routes any request to `/api/*` to the matching file in `/api/`.
No configuration needed.

---

## Customisation

**Change the prompt:** Edit `buildPrompt()` in `api/generateContent.js`

**Add a new output field:** Add to the JSON format in `buildPrompt()`, then add to `fields` array in `PosterPanel.jsx` or `MediaPanel.jsx`

---

## Setting up Firebase Firestore

Step 1 — Enable Firestore
- Go to Firebase Console → your project → Firestore Database → Create database
- Start in production mode, choose a region close to you

Step 2 — Create a Service Account
- Firebase Console → Project Settings → Service Accounts
- Click "Generate new private key" → downloads a JSON file

Step 3 — Add env vars
From the downloaded JSON file, copy these three values 
into .env.local (local) and Vercel Environment Variables (production):
  FIREBASE_PROJECT_ID     → "project_id" field
  FIREBASE_CLIENT_EMAIL   → "client_email" field  
  FIREBASE_PRIVATE_KEY    → "private_key" field (the whole string including \n)

Step 4 — Add Firestore index
The explore query uses orderBy('savedAt') — Firestore will show a link 
in the server logs the first time it runs to create the required index.
Click that link and create it. Takes about 1 minute.

Free tier limits (plenty for a college team):
  50,000 reads/day
  20,000 writes/day
  1 GB storage

**Change the model:** Edit `model: 'gpt-4o-mini'` in `api/generateContent.js`

**Style changes:** All styles are in one file: `src/styles.css`
