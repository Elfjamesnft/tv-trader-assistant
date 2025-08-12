// api/getChartData.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol" });
  }

  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`);
    const data = await response.json();

    if (!data.chart || data.chart.error) {
      return res.status(500).json({ error: "Error fetching chart data" });
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    const ohlcData = timestamps.map((time, i) => ({
      time: new Date(time * 1000).toISOString(),
      open: quotes.open[i],
      high: quotes.high[i],
      low: quotes.low[i],
      close: quotes.close[i],
      volume: quotes.volume[i]
    }));

    res.status(200).json(ohlcData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
