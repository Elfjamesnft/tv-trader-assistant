// lib/rules.js
// Simple rule engine: SMA trend, RSI-like momentum (approx), volatility via ATR-ish measure, and news/sentiment contrarian checks

function sma(arr, period) {
  if (!arr || arr.length < period) return null;
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    if (i + 1 < period) { out.push(null); continue; }
    let sum = 0;
    for (let j = i + 1 - period; j <= i; j++) sum += arr[j];
    out.push(sum / period);
  }
  return out;
}

function simpleRSI(closes, period = 14) {
  if (!closes || closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gains += d; else losses += -d;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  let lastRsi = 50;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(0, d)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(0, -d)) / period;
    const rs = avgGain / (avgLoss || 1e-9);
    lastRsi = 100 - (100 / (1 + rs));
  }
  return lastRsi;
}

function atrApprox(high, low, close, period = 14) {
  if (!close || close.length < period + 1) return null;
  const trs = [];
  for (let i = 1; i < close.length; i++) {
    trs.push(Math.max(high[i] - low[i], Math.abs(high[i] - close[i - 1]), Math.abs(low[i] - close[i - 1])));
  }
  // simple SMA of TRs
  let sum = 0; let count = 0;
  for (let i = Math.max(0, trs.length - period); i < trs.length; i++) {
    sum += trs[i]; count++;
  }
  return count ? sum / count : null;
}

export function analyzeWithRules({ symbol, ohlc = [], headlines = [], sentiment = null }) {
  const closes = ohlc.map(d => d.close).filter(Number.isFinite);
  const highs = ohlc.map(d => d.high).filter(Number.isFinite);
  const lows = ohlc.map(d => d.low).filter(Number.isFinite);
  const volumes = ohlc.map(d => d.volume).filter(Number.isFinite);

  if (closes.length < 20) {
    return { action: "HOLD", score: 0.5, reasons: ["Not enough data (need ≥ 20 candles)"] };
  }

  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const latest = {
    close: closes[closes.length - 1],
    sma20: sma20[sma20.length - 1],
    sma50: sma50[sma50.length - 1],
    rsi: simpleRSI(closes, 14),
    atr: atrApprox(highs, lows, closes, 14),
    volume: volumes[volumes.length - 1]
  };

  const reasons = [];
  let score = 0;

  // trend
  if (latest.sma20 && latest.sma50) {
    if (latest.sma20 > latest.sma50) { score += 0.35; reasons.push("Short-term SMA above long-term SMA → trend bullish"); }
    else { score -= 0.35; reasons.push("Short-term SMA below long-term SMA → trend bearish"); }
  } else {
    reasons.push("SMA not available for full periods");
  }

  // momentum
  if (latest.rsi) {
    if (latest.rsi < 35) { score += 0.25; reasons.push("RSI in oversold range — mean-reversion buy potential"); }
    else if (latest.rsi > 65) { score -= 0.25; reasons.push("RSI in overbought range — caution/possible reversal"); }
    else reasons.push("RSI neutral");
  }

  // volatility / regime
  if (latest.atr) {
    // higher ATR -> more volatility; no direct score but affect explanation
    if (latest.atr > (latest.close * 0.02)) reasons.push("ATR indicates elevated volatility — expect larger moves");
    else reasons.push("Volatility moderate");
  }

  // news: simple keyword check for important macro
  const macroKeywords = ["cpi", "inflation", "fed", "interest rate", "jobs"];
  const matched = (headlines || []).filter(h => macroKeywords.some(k => (h.title || "").toLowerCase().includes(k)));
  if (matched.length) {
    reasons.push(`Macro headlines detected: ${matched[0].title}`);
    // increase caution a bit
    score -= 0.05;
  }

  // sentiment contrarian checks
  if (sentiment && typeof sentiment.bullishPercent === "number") {
    const b = sentiment.bullishPercent;
    if (b > 75) { score -= 0.12; reasons.push("Strongly bullish crowd sentiment — contrarian caution"); }
    else if (b < 25) { score += 0.12; reasons.push("Strongly bearish crowd sentiment — contrarian buying opportunity"); }
    else reasons.push("Sentiment neutral");
  }

  const normScore = Math.max(-1, Math.min(1, score));
  let action = "HOLD";
  if (normScore > 0.15) action = "BUY";
  if (normScore < -0.15) action = "SELL";

  const confidence = Math.round((0.5 + normScore / 2) * 100);

  return {
    action,
    score: (0.5 + normScore / 2),
    confidence,
    reasons,
    indicators: latest
  };
}
