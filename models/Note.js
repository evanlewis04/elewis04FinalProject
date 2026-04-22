const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        ticker: { type: String, required: true, uppercase: true, trim: true, maxlength: 10 },
        layer: { type: String, required: true, trim: true, maxlength: 30 },
        author: { type: String, required: true, trim: true, maxlength: 60 },
        body: { type: String, required: true, trim: true, maxlength: 1000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
