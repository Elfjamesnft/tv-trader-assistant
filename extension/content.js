// extension/content.js
(async function(){
  console.log("Trader Assistant content script loaded.");

  function detectSymbol() {
    const selCandidates = [
      '.tv-symbol-header__first-line',
      '.chart-title--symbol',
      '.tv-symbol-header__symbol',
      '.tv-header__title--symbol',
      '.tv-symbol'
    ];
    for (const s of selCandidates) {
      const el = document.querySelector(s);
      if (el && el.innerText) return el.innerText.trim();
    }
    // fallback from url
    const m = location.pathname.match(/symbol\\/([^/]+)/);
    if (m) return decodeURIComponent(m[1]);
    return null;
  }

  async function analyze(symbol) {
    const API_BASE = "https://tv-trader-assistant-public-ou6ml7pvo.vercel.app";
    try {
      const resp = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol })
      });
      const j = await resp.json();
      return j;
    } catch (err) {
      return { error: err.message };
    }
  }

  function renderResult(container, json) {
    if (!container) return;
    if (json.error) {
      container.innerText = "Error: " + json.error;
      return;
    }
    const a = json.analysis;
    container.innerHTML = `
      <div style="font-weight:700">${a.action || a.action}</div>
      <div>Confidence: ${a.confidence || (a.score ? Math.round(a.score*100) : 'n/a')}%</div>
      <div><strong>Reasons</strong><ul>${(a.reasons||[]).map(r=>`<li>${r}</li>`).join('')}</ul></div>
      <div style="font-size:12px;color:#9fb3d6">Indicator snapshot: close ${a.indicators?.close || 'n/a'}</div>
    `;
  }

  // Simple overlay container
  const id = 'tta-overlay';
  let overlay = document.getElementById(id);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.style = 'position:fixed;right:18px;top:88px;z-index:999999;background:#071025;color:#e6f0ff;padding:12px;border-radius:10px;width:320px;font-family:Inter,Arial;font-size:13px';
    overlay.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><strong>TraderAssistant</strong><div><button id="tta-refresh">🔁</button><button id="tta-close">✖</button></div></div><div id="tta-body" style="margin-top:8px">Ready</div>`;
    document.body.appendChild(overlay);
    document.getElementById('tta-close').addEventListener('click', ()=>overlay.remove());
    document.getElementById('tta-refresh').addEventListener('click', run);
  }

  async function run() {
    const symbol = detectSymbol();
    const body = document.getElementById('tta-body');
    if (!symbol) { body.innerText = "Couldn't detect symbol. Click the chart header and retry."; return; }
    body.innerHTML = `Detecting ${symbol}... requesting analysis...`;
    const result = await analyze(symbol);
    if (result.error) body.innerText = "Server error: " + result.error;
    else renderResult(body, result);
  }

  // initial auto-run
  setTimeout(run, 1200);
})();
