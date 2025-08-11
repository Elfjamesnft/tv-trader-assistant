(function() {
  console.log("Trader Assistant content script loaded.");

  // Example function to detect TradingView symbol
  function getSymbol() {
    const el = document.querySelector('[class*="tv-symbol-header__first-line"]');
    return el ? el.innerText.trim() : null;
  }

  // Example annotation
  function drawSignal(signal, reason) {
    alert(`Signal: ${signal}\nReason: ${reason}`);
  }

  // Simple test
  setTimeout(() => {
    const symbol = getSymbol();
    if (symbol) {
      drawSignal("BUY", `Detected bullish pattern on ${symbol}`);
    }
  }, 5000);
})();
