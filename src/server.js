require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_QUOTE_URL = "https://finnhub.io/api/v1/quote";

const historyBySymbol = new Map();
const jobsBySymbol = new Map();

function normalizeSymbol(symbol) {
  return String(symbol).trim().toUpperCase();
}

function ensureHistory(symbol) {
  if (!historyBySymbol.has(symbol)) {
    historyBySymbol.set(symbol, []);
  }
  return historyBySymbol.get(symbol);
}

function validateSymbol(symbol) {
  return typeof symbol === "string" && symbol.trim().length > 0;
}

function validateNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

async function fetchStockRecord(symbol) {
  if (!FINNHUB_API_KEY) {
    throw new Error("Missing FINNHUB_API_KEY environment variable.");
  }

  const url = `${FINNHUB_QUOTE_URL}?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(FINNHUB_API_KEY)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Finnhub request failed with status ${response.status}.`);
  }

  const quote = await response.json();

  return {
    openPrice: quote.o,
    highPrice: quote.h,
    lowPrice: quote.l,
    currentPrice: quote.c,
    previousClosePrice: quote.pc,
    fetchedAt: new Date().toISOString()
  };
}

async function fetchAndStore(symbol) {
  const record = await fetchStockRecord(symbol);
  const history = ensureHistory(symbol);
  history.push(record);
  return record;
}

app.post("/start-monitoring", (req, res) => {
  const { symbol, minutes, seconds } = req.body || {};

  if (!validateSymbol(symbol)) {
    return res.status(400).json({ error: "symbol must be a non-empty string." });
  }

  if (!validateNonNegativeInteger(minutes) || !validateNonNegativeInteger(seconds)) {
    return res.status(400).json({ error: "minutes and seconds must be non-negative integers." });
  }

  const symbolKey = normalizeSymbol(symbol);
  const intervalMs = (minutes * 60 + seconds) * 1000;

  if (intervalMs <= 0) {
    return res.status(400).json({ error: "Total interval must be greater than zero." });
  }

  const existingJob = jobsBySymbol.get(symbolKey);
  if (existingJob) {
    clearInterval(existingJob);
  }

  const job = setInterval(async () => {
    try {
      await fetchAndStore(symbolKey);
    } catch (error) {
      console.error(`Monitoring fetch failed for ${symbolKey}:`, error.message);
    }
  }, intervalMs);

  jobsBySymbol.set(symbolKey, job);

  return res.status(200).json({
    message: "Monitoring started.",
    symbol: symbolKey,
    intervalMs
  });
});

app.get("/history", (req, res) => {
  const { symbol } = req.query;

  if (!validateSymbol(symbol)) {
    return res.status(400).json({ error: "symbol query parameter must be a non-empty string." });
  }

  const symbolKey = normalizeSymbol(symbol);
  const history = historyBySymbol.get(symbolKey) || [];
  return res.status(200).json(history);
});

app.post("/refresh", async (req, res) => {
  const { symbol } = req.body || {};

  if (!validateSymbol(symbol)) {
    return res.status(400).json({ error: "symbol must be a non-empty string." });
  }

  const symbolKey = normalizeSymbol(symbol);

  try {
    const record = await fetchAndStore(symbolKey);
    return res.status(200).json(record);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
