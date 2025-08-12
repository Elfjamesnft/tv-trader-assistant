// api/news.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // quick trending tickers/headline summary via Yahoo’s trending endpoint
    const r = await fetch("https://query1.finance.yahoo.com/v1/finance/trending/US");
    const j = await r.json();
    const quotes = (j.finance && j.finance.result && j.finance.result[0] && j.finance.result[0].quotes) || [];
    const headlines = quotes.map(q => ({
      symbol: q.symbol,
      name: q.shortName || q.longName || "",
      changePercent: q.regularMarketChangePercent?.fmt || ""
    }));
    return res.status(200).json({ headlines });
  } catch (err) {
    console.error("news error", err);
    return res.status(500).json({ error: err.message });
  }
}


