const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
    {
        ticker: { type: String, required: true, uppercase: true, trim: true, maxlength: 10, unique: true },
        layer: {
            type: String,
            required: true,
            enum: ["energy", "chips", "infrastructure", "models", "application"],
        },
        note: { type: String, trim: true, maxlength: 200, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("WatchlistItem", watchlistSchema);
