// api/analyze.js
import fetch from "node-fetch";
import { analyzeWithRules } from "../lib/rules.js";

export default async function handler(req, res) {
  try {
    const symbol = (req.body?.symbol || req.query.symbol || "").toString().trim();
    if (!symbol) return res.status(400).json({ error: "Missing symbol (POST body: { symbol })" });

    // retrieve chart (1 month by default)
    const chartReq = await fetch(`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/api/getChartData?symbol=${encodeURIComponent(symbol)}&interval=1d&range=1mo`, {
      headers: { 'user-agent': 'node' }
    }).catch(() => null);

    // If calling internal route via full URL fails (sometimes Vercel internal), call function directly:
    // To be robust, fetch Yahoo directly here:
    const chartResp = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo`, { headers: { "User-Agent": "Mozilla/5.0" } });
    const chartJson = await chartResp.json();
    const result = chartJson.chart && chartJson.chart.result && chartJson.chart.result[0];
    if (!result) return res.status(500).json({ error: "No chart result from Yahoo", raw: chartJson });

    const timestamps = result.timestamp || [];
    const quote = result.indicators && result.indicators.quote && result.indicators.quote[0];
    const ohlc = timestamps.map((t, i) => ({
      time: new Date(t * 1000).toISOString(),
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i]
    })).filter(x => Number.isFinite(x.close));

    // sentiment
    let sentiment = { bullishPercent: 50, bearishPercent: 50 };
    try {
      const sentResp = await fetch(`https://tv-trader-assistant-public-ou6ml7pvo.vercel.app/api/sentiment?symbol=${encodeURIComponent(symbol)}`);
      if (sentResp.ok) sentiment = await sentResp.json();
    } catch (e) { /* ignore; fallback used */ }

    // headlines
    let headlines = [];
    try {
      const newsResp = await fetch(`https://tv-trader-assistant-public-ou6ml7pvo.vercel.app/api/news`);
      if (newsResp.ok) {
        const nj = await newsResp.json();
        headlines = nj.headlines || [];
      }
    } catch(e) { /* ignore */ }

    // analyze rules
    const analysis = analyzeWithRules({ symbol, ohlc, headlines, sentiment });

    return res.status(200).json({ ok: true, symbol, analysis, headlines, sentiment });
  } catch (err) {
    console.error("analyze error", err);
    return res.status(500).json({ error: err.message });
  }
}
