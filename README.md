Blockchain Monitor Dashboard

A real-time cryptocurrency and blockchain analytics dashboard built with JavaScript. This project fetches and displays live data from multiple APIs, including CoinGecko (prices, trends, global stats), Blockcypher (blocks, transactions), and Blockchain.info (network health, transaction volume). Features include:

    Price Ticker: Top 5 coins by market cap with price, volume, and 24h change.
    Trending Coins: Top trending cryptocurrencies from CoinGecko.
    Blockchain Stats: Global crypto stats like active currencies, market cap, and sentiment.
    Latest Blocks & Transactions: Real-time Bitcoin block and transaction data.
    Network Health: Difficulty, hash rate, mempool size, and fee estimates.
    Transaction Chart: 24-hour transaction volume visualized with Chart.js.
    Dark Pool Tracker: Highlights high-value unconfirmed transactions.
    Search: Look up detailed coin data by ID (e.g., "bitcoin").
    Export: Save dashboard data as JSON.

Key Features

    CORS Proxy: Uses cors-anywhere to bypass CORS restrictions (Note: Requires a running proxy instance).
    Error Handling: Fallback to mock data if APIs fail.
    Dynamic Updates: Refreshes every minute with staggered requests to avoid rate limits.
    Responsive Design: Card-based UI for easy readability.

APIs Used

    CoinGecko: /coins/markets, /search/trending, /global
    Blockcypher: /btc/main, /blocks, /txs
    Blockchain.info: /stats, /charts, /q

Setup

    Clone the repo: git clone <repo-url>
    Open index.html in a browser (ensure CORS proxy is active or host locally).
    Optional: Serve via a local server (e.g., npx live-server) for full functionality.

Dependencies

    Chart.js (for transaction volume graph)

Notes

    Mock data ensures functionality during API downtime.
    CORS proxy may require activation at https://cors-anywhere.herokuapp.com/ or a custom instance.

Contributions welcome! Ideal for crypto enthusiasts, developers, or anyone tracking blockchain trends.
