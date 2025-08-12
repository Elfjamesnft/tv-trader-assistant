// Simplified Adaptive Markets logic
export function adaptiveAnalysis(priceData) {
  // priceData: array of {time, open, high, low, close}
  if (!priceData || priceData.length < 5) {
    return { signal: "HOLD", reason: "Not enough data for analysis" };
  }

  const lastClose = priceData[priceData.length - 1].close;
  const avgClose = priceData.reduce((sum, p) => sum + p.close, 0) / priceData.length;

  if (lastClose > avgClose * 1.02) {
    return { signal: "BUY", reason: "Price above 2% of moving average — bullish trend" };
  }
  if (lastClose < avgClose * 0.98) {
    return { signal: "SELL", reason: "Price below 2% of moving average — bearish trend" };
  }

  return { signal: "HOLD", reason: "Price within neutral range" };
}
