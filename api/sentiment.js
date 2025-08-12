// api/sentiment.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || req.body?.symbol || "").toString().trim().toUpperCase();

    // If crypto (BTC in symbol) use Fear & Greed index
    if (symbol.includes("BTC")) {
      const r = await fetch("https://api.alternative.me/fng/");
      const j = await r.json();
      const raw = j?.data?.[0]?.value;
      const value = raw ? parseInt(raw, 10) : 50;
      // Convert FNG to simple bullish/bearish proxy
      const bullishPercent = value > 50 ? value : 100 - value;
      const bearishPercent = 100 - bullishPercent;
      return res.status(200).json({ source: "fear-and-greed", value, bullishPercent, bearishPercent });
    }

    // Fallback: quick pseudo-sentiment using a random (placeholder). Later you can connect StockTwits or social APIs.
    const rand = Math.floor(Math.random() * 100);
    return res.status(200).json({ source: "fallback-random", bullishPercent: rand, bearishPercent: 100 - rand });

  } catch (err) {
    console.error("sentiment error", err);
    return res.status(500).json({ error: err.message });
  }
}
