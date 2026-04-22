**Submitted by:** Evan Lewis (evanlewis04)

**Group Members:** Evan Lewis (evanlewis04)

**App Description:** A dashboard that tracks the financial performance and role of the largest publicly traded companies across the AI supply chain, organized by the five-layer cake (Energy, Chips, Infrastructure, Models, Application). Users can add analyst notes and a custom watchlist, both stored in MongoDB.

**YouTube Video Link:** https://www.youtube.com/REPLACE_WITH_YOUR_VIDEO

**APIs:** Finnhub Stock API (https://finnhub.io/docs/api) — used for live stock quotes (`/quote`) and company profiles (`/stock/profile2`).

**Contact Email:** evanmlewis21@gmail.com

**Deployed App Link:** https://REPLACE_WITH_RENDER_URL.onrender.com

**AI Use:** 1. Claude Code

---

## Overview

This Node.js / Express / MongoDB app visualizes the AI supply chain across five layers:

| Layer | What it covers |
| --- | --- |
| Energy | Power producers and grid operators feeding AI data centers (NEE, CEG, VST, GEV, ETR) |
| Chips | Semiconductor designers, fabs and equipment makers (NVDA, AMD, TSM, ASML, AVGO, MU, INTC) |
| Infrastructure | Hyperscale clouds, data center REITs, networking and server OEMs (MSFT, AMZN, ORCL, DELL, EQIX, DLR, ANET) |
| Models | Foundation-model developers and AI platforms (GOOGL, META, MSFT, AMZN, IBM, BIDU) |
| Application | End-user AI products (CRM, ADBE, NOW, SNOW, PLTR, CRWD, DUOL) |

Each company card shows the live price and daily change pulled from Finnhub. A bar chart at the top compares the average daily move of every layer.

## Features

- **Five-layer-cake dashboard** with company role descriptions and live quotes from Finnhub.
- **Layer performance chart** (Chart.js) showing average daily change per layer.
- **Two forms**: add an analyst note about any tracked company, and add a custom ticker to a watchlist (validated against Finnhub before saving).
- **Persistent storage** in MongoDB via Mongoose for both notes and watchlist items.
- **`express.Router()` everywhere** — separate routers for the data API, notes, and watchlist.
- **Custom CSS file** with `background-color`, `color`, `font-size` and the Google Font *Space Grotesk* (plus *JetBrains Mono*).
- **Server-side caching** so the free Finnhub tier stays inside its 60 req/min quota.

## Project Structure

```
335 Final Project/
├── server.js                # Express entry point + Mongoose connection
├── package.json
├── .env.example             # Template for MONGODB_URI and FINNHUB_API_KEY
├── data/
│   └── companies.js         # Five-layer-cake company catalog
├── models/
│   ├── Note.js              # Mongoose schema for analyst notes
│   └── WatchlistItem.js     # Mongoose schema for watchlist entries
├── routes/
│   ├── apiRoutes.js         # /api/layers, /api/companies, /api/quote, /api/quotes
│   ├── notesRoutes.js       # /api/notes CRUD
│   └── watchlistRoutes.js   # /api/watchlist CRUD
├── services/
│   └── finnhub.js           # Finnhub HTTP client + 60s in-memory cache
└── public/
    ├── index.html           # Dashboard SPA
    ├── style.css            # Custom CSS with Google Font
    └── app.js               # Frontend logic + Chart.js
```

## Local Development

1. Clone the repo and `cd` into it.
2. `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — connection string for a MongoDB Atlas database (instructions in `TODO.md`).
   - `FINNHUB_API_KEY` — free API key from https://finnhub.io/register
4. `npm start`
5. Open http://localhost:3000

## Deployment

Deployed to Render as a Web Service. Environment variables `MONGODB_URI`, `FINNHUB_API_KEY` and (optionally) `PORT` must be configured in the Render dashboard. See `TODO.md` for the full step-by-step deployment checklist.
