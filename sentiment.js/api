// api/sentiment.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { symbol } = req.query;

  try {
    if (symbol && symbol.toUpperCase().includes("BTC")) {
      // Crypto sentiment
      const response = await fetch("https://api.alternative.me/fng/");
      const data = await response.json();
      const value = parseInt(data.data[0].value, 10);

      res.status(200).json({
        bullishPercent: value > 50 ? value : 100 - value,
        bearishPercent: value > 50 ? 100 - value : value
      });
    } else {
      // Fallback sentiment for stocks (dummy — could hook into StockTwits)
      const randomBullish = Math.floor(Math.random() * 100);
      res.status(200).json({
        bullishPercent: randomBullish,
        bearishPercent: 100 - randomBullish
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
