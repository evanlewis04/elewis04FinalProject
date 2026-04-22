const axios = require("axios");

const BASE_URL = "https://finnhub.io/api/v1";

// Simple in-memory cache so we do not hammer the free Finnhub tier (60 req/min).
const cache = new Map();
const TTL_MS = 60 * 1000;

function fromCache(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.time < TTL_MS) return entry.data;
    return null;
}

function toCache(key, data) {
    cache.set(key, { time: Date.now(), data });
}

async function fetchQuote(ticker) {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
        throw new Error("FINNHUB_API_KEY environment variable is not set.");
    }
    const upper = ticker.toUpperCase();
    const cached = fromCache(`q:${upper}`);
    if (cached) return cached;

    const { data } = await axios.get(`${BASE_URL}/quote`, {
        params: { symbol: upper, token: apiKey },
        timeout: 8000,
    });

    // Finnhub returns { c, d, dp, h, l, o, pc, t } — current, change, change %, high, low, open, prev close, timestamp.
    const quote = {
        ticker: upper,
        current: data.c ?? null,
        change: data.d ?? null,
        changePercent: data.dp ?? null,
        high: data.h ?? null,
        low: data.l ?? null,
        open: data.o ?? null,
        previousClose: data.pc ?? null,
        timestamp: data.t ?? null,
    };
    toCache(`q:${upper}`, quote);
    return quote;
}

async function fetchProfile(ticker) {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error("FINNHUB_API_KEY environment variable is not set.");
    const upper = ticker.toUpperCase();
    const cached = fromCache(`p:${upper}`);
    if (cached) return cached;

    const { data } = await axios.get(`${BASE_URL}/stock/profile2`, {
        params: { symbol: upper, token: apiKey },
        timeout: 8000,
    });
    const profile = {
        ticker: upper,
        name: data.name ?? null,
        country: data.country ?? null,
        currency: data.currency ?? null,
        exchange: data.exchange ?? null,
        ipo: data.ipo ?? null,
        marketCap: data.marketCapitalization ?? null,
        sharesOutstanding: data.shareOutstanding ?? null,
        logo: data.logo ?? null,
        weburl: data.weburl ?? null,
        industry: data.finnhubIndustry ?? null,
    };
    toCache(`p:${upper}`, profile);
    return profile;
}

async function fetchQuoteAndProfile(ticker) {
    const [quote, profile] = await Promise.all([fetchQuote(ticker), fetchProfile(ticker)]);
    return { ...quote, profile };
}

module.exports = { fetchQuote, fetchProfile, fetchQuoteAndProfile };
