# TV Trader Assistant

A free, public Chrome Extension + backend that provides **rule-based trading analysis** using principles from Adaptive Markets Theory, market strategy, and “trading against the crowd.”

It works with **stocks, indices, crypto, commodities**, and supports **any timeframe**.  
The extension fetches real market data, sentiment, and relevant news, then gives clear buy/sell/hold recommendations **with reasons**.

---

## Features
- 📊 Analyzes OHLC data & sentiment
- 📰 Pulls latest market news (configurable API)
- 🧠 Adaptive Markets + contrarian trading rules
- ⚡ Works on TradingView or any ticker you enter
- 🌐 Public backend on Vercel (Node.js API)

---

## How it Works
1. **Backend (Vercel API)**  
   - Fetches chart data (Yahoo Finance API or similar)
   - Gets sentiment/news
   - Runs rule-based engine in `lib/rules.js`
   - Returns decision + reasoning

2. **Chrome Extension**  
   - User inputs a symbol (`AAPL`, `BTC-USD`, etc.)
   - Extension sends request to backend
   - Displays advice and reasons
   - Can fetch relevant news

---

## Folder Structure
tv-trader-assistant-public/
│
├── api/ # Backend API endpoints (runs on Vercel)
│ ├── analyze.js
│ ├── getChartData.js
│ ├── sentiment.js
│ └── news.js
│
├── lib/ # Trading rules & logic
│ └── rules.js
│
├── extension/ # Chrome extension files
│ ├── manifest.json
│ ├── background.js
│ ├── popup.html
│ ├── popup.js
│ └── styles.css
│
└── README.md

yaml
Copy
Edit

---

## Installation & Setup

### 1. Deploy Backend
1. Fork or clone this repo.
2. Connect to **Vercel** (import GitHub repo).
3. Deploy — you’ll get a live API URL like:  
https://your-project-name.vercel.app

yaml
Copy
Edit
4. Update `extension/background.js` with your API URL.

---

### 2. Load Chrome Extension
1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Extension icon should appear in toolbar

---

### 3. Test
1. Click extension icon
2. Enter a symbol (e.g. `AAPL` or `BTC-USD`)
3. Click **Analyze** — see advice & reasoning
4. Click **Get News** — see market headlines

---

## Notes
- This is for **educational purposes only** — not financial advice.
- APIs may require free keys if rate limits are exceeded.
- You can swap APIs in `/api` endpoints.

---

## License
MIT — free to use, modify, and share.
