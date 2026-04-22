const express = require("express");
const { layers, getAllCompanies, getLayer, getCompany } = require("../data/companies");
const { fetchQuoteAndProfile, fetchQuote } = require("../services/finnhub");

const router = express.Router();

// GET /api/layers — full layer-cake metadata (no live quotes).
router.get("/layers", (req, res) => {
    const ordered = Object.values(layers).sort((a, b) => a.order - b.order);
    res.json(ordered);
});

// GET /api/layers/:key — single layer.
router.get("/layers/:key", (req, res) => {
    const layer = getLayer(req.params.key);
    if (!layer) return res.status(404).json({ error: "Layer not found" });
    res.json(layer);
});

// GET /api/companies — flat list of every tracked company.
router.get("/companies", (req, res) => {
    res.json(getAllCompanies());
});

// GET /api/quote/:ticker — live quote + profile from Finnhub.
router.get("/quote/:ticker", async (req, res) => {
    try {
        const data = await fetchQuoteAndProfile(req.params.ticker);
        res.json(data);
    } catch (err) {
        console.error(`Quote error for ${req.params.ticker}:`, err.message);
        res.status(502).json({ error: "Failed to fetch quote", details: err.message });
    }
});

// GET /api/quotes?tickers=NVDA,AMD,... — batch quote endpoint, used by the dashboard.
router.get("/quotes", async (req, res) => {
    const raw = (req.query.tickers || "").trim();
    if (!raw) return res.status(400).json({ error: "Missing tickers query param" });
    const tickers = raw
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 25);

    const results = await Promise.all(
        tickers.map(async (t) => {
            try {
                return await fetchQuote(t);
            } catch (err) {
                return { ticker: t, error: err.message };
            }
        })
    );
    res.json(results);
});

module.exports = router;
