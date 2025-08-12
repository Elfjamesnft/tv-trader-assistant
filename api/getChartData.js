// api/getChartData.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || req.body?.symbol || "").toString().trim();
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    // Fetch 1 month daily data by default (adjust interval/range if you like)
    const interval = req.query.interval || "1d";
    const range = req.query.range || "1mo";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const j = await r.json();

    if (!j.chart || !j.chart.result || !j.chart.result[0]) {
      return res.status(500).json({ error: "No chart data", raw: j });
    }

    const result = j.chart.result[0];
    const timestamps = result.timestamp || [];
    const quote = result.indicators && result.indicators.quote && result.indicators.quote[0];
    if (!quote) return res.status(500).json({ error: "No quote data" });

    const ohlc = timestamps.map((t, i) => ({
      time: new Date(t * 1000).toISOString(),
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i]
    })).filter(x => Number.isFinite(x.close)); // drop nulls

    return res.status(200).json({ symbol, interval, range, ohlc });
  } catch (err) {
    console.error("getChartData error:", err);
    return res.status(500).json({ error: err.message });
  }
}

