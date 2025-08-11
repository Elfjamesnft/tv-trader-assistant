// Trading against the crowd
export function contrarianSignal(sentiment) {
  // sentiment: percentage bullish from 0 to 100
  if (sentiment > 80) {
    return { signal: "SELL", reason: "Extreme bullish sentiment — potential reversal down" };
  }
  if (sentiment < 20) {
    return { signal: "BUY", reason: "Extreme bearish sentiment — potential reversal up" };
  }
  return { signal: "HOLD", reason: "Sentiment in balanced zone" };
}
