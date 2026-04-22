const express = require("express");
const WatchlistItem = require("../models/WatchlistItem");
const { fetchQuoteAndProfile } = require("../services/finnhub");

const router = express.Router();

const VALID_LAYERS = ["energy", "chips", "infrastructure", "models", "application"];

// GET /api/watchlist — list watchlist items with live quote data attached.
router.get("/", async (req, res) => {
    try {
        const items = await WatchlistItem.find().sort({ createdAt: -1 }).lean();
        const enriched = await Promise.all(
            items.map(async (item) => {
                try {
                    const data = await fetchQuoteAndProfile(item.ticker);
                    return { ...item, quote: data };
                } catch (err) {
                    return { ...item, quote: null, quoteError: err.message };
                }
            })
        );
        res.json(enriched);
    } catch (err) {
        console.error("List watchlist error:", err.message);
        res.status(500).json({ error: "Failed to load watchlist" });
    }
});

// POST /api/watchlist — add a custom ticker to the watchlist.
router.post("/", async (req, res) => {
    try {
        const { ticker, layer, note } = req.body || {};
        if (!ticker || !layer) {
            return res.status(400).json({ error: "ticker and layer are required" });
        }
        if (!VALID_LAYERS.includes(layer)) {
            return res.status(400).json({ error: `layer must be one of ${VALID_LAYERS.join(", ")}` });
        }
        const upper = ticker.toString().toUpperCase().trim();

        // Validate the ticker exists by trying to pull a quote.
        try {
            await fetchQuoteAndProfile(upper);
        } catch (err) {
            return res.status(400).json({ error: `Could not verify ticker '${upper}': ${err.message}` });
        }

        const item = await WatchlistItem.create({
            ticker: upper,
            layer,
            note: (note || "").toString().slice(0, 200),
        });
        res.status(201).json(item);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "Ticker already on watchlist" });
        }
        console.error("Create watchlist error:", err.message);
        res.status(500).json({ error: "Failed to save watchlist item" });
    }
});

// DELETE /api/watchlist/:id — remove an item.
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await WatchlistItem.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Not found" });
        res.json({ success: true });
    } catch (err) {
        console.error("Delete watchlist error:", err.message);
        res.status(500).json({ error: "Failed to delete item" });
    }
});

module.exports = router;
