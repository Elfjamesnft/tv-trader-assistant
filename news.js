// api/news.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://query1.finance.yahoo.com/v1/finance/trending/US");
    const data = await response.json();

    if (!data.finance || !data.finance.result) {
      return res.status(500).json({ error: "Error fetching news" });
    }

    const headlines = data.finance.result[0].quotes.map(q => ({
      symbol: q.symbol,
      name: q.shortName || q.longName || "",
      changePercent: q.regularMarketChangePercent?.fmt || "",
    }));

    res.status(200).json(headlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
