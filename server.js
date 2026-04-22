require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");

const apiRoutes = require("./routes/apiRoutes");
const notesRoutes = require("./routes/notesRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Health check (handy for Render's uptime probes).
app.get("/healthz", (req, res) => {
    res.json({
        status: "ok",
        mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        finnhub: Boolean(process.env.FINNHUB_API_KEY),
    });
});

app.use("/api", apiRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/watchlist", watchlistRoutes);

// SPA fallback — serve the dashboard for any non-API GET so deep links keep working.
app.get(/^\/(?!api|healthz).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function start() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.warn(
            "[warn] MONGODB_URI is not set — notes/watchlist will fail. Copy .env.example to .env and fill it in."
        );
    } else {
        try {
            await mongoose.connect(mongoUri);
            console.log("[mongo] connected");
        } catch (err) {
            console.error("[mongo] connection failed:", err.message);
        }
    }
    app.listen(PORT, () => {
        console.log(`[server] listening on http://localhost:${PORT}`);
    });
}

start();
