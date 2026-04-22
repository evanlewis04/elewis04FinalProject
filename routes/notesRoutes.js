const express = require("express");
const Note = require("../models/Note");
const { getCompany } = require("../data/companies");

const router = express.Router();

// GET /api/notes?ticker=NVDA — list notes (optionally filtered).
router.get("/", async (req, res) => {
    try {
        const filter = {};
        if (req.query.ticker) filter.ticker = req.query.ticker.toUpperCase();
        const notes = await Note.find(filter).sort({ createdAt: -1 }).limit(100).lean();
        res.json(notes);
    } catch (err) {
        console.error("List notes error:", err.message);
        res.status(500).json({ error: "Failed to load notes" });
    }
});

// POST /api/notes — create a new analyst note. Form submits to here.
router.post("/", async (req, res) => {
    try {
        const { ticker, author, body } = req.body || {};
        if (!ticker || !author || !body) {
            return res.status(400).json({ error: "ticker, author and body are required" });
        }
        const company = getCompany(ticker);
        if (!company) {
            return res.status(400).json({ error: `Unknown ticker '${ticker}'` });
        }
        const note = await Note.create({
            ticker: company.ticker,
            layer: company.layer,
            author: author.toString().slice(0, 60),
            body: body.toString().slice(0, 1000),
        });
        res.status(201).json(note);
    } catch (err) {
        console.error("Create note error:", err.message);
        res.status(500).json({ error: "Failed to save note" });
    }
});

// DELETE /api/notes/:id — remove a note.
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Note.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Not found" });
        res.json({ success: true });
    } catch (err) {
        console.error("Delete note error:", err.message);
        res.status(500).json({ error: "Failed to delete note" });
    }
});

module.exports = router;
