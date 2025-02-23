const COINGECKO_API = "https://api.coingecko.com/api/v3";
const BLOCKCYPHER_API = "https://api.blockcypher.com/v1/btc/main";
const BLOCKCHAIN_API = "https://blockchain.info";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"; // Free CORS proxy

// Fetch data from API with error handling and proxy fallback
async function fetchData(url, useProxy = true) {
    const fetchUrl = useProxy ? `${CORS_PROXY}${url}` : url;
    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`Network response not ok: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error.message);
        return null;
    }
}

// Mock data for fallback
const mockData = {
    priceTicker: [
        { name: "Bitcoin", symbol: "BTC", current_price: 60000, total_volume: 30000000000, price_change_percentage_24h: 2.5 },
        { name: "Ethereum", symbol: "ETH", current_price: 4000, total_volume: 15000000000, price_change_percentage_24h: -1.2 }
    ],
    trendingCoins: [
        { item: { name: "Bitcoin", symbol: "BTC", market_cap_rank: 1, score: 10 } },
        { item: { name: "Ethereum", symbol: "ETH", market_cap_rank: 2, score: 8 } }
    ],
    blockchainStats: {
        data: {
            active_cryptocurrencies: 12000,
            markets: 500,
            total_volume: { usd: 1000000000000 },
            market_cap_percentage: { btc: 40, eth: 20 },
            total_market_cap: { usd: 2500000000000 },
            market_cap_change_percentage_24h_usd: 1.5
        }
    },
    latestBlocks: [
        { height: 700000, time: new Date().toISOString(), n_tx: 2500, size: 1024000, total: 625000000, fee: 2500000, hash: "00000000000000000000" }
    ],
    latestTransactions: [
        { hash: "abcdef1234567890", total: 100000000, fees: 10000, received: new Date().toISOString(), inputs: [{}, {}], outputs: [{}] }
    ],
    transactionChart: {
        values: Array(24).fill().map((_, i) => ({ x: Math.floor(Date.now() / 1000) - (i * 3600), y: 2000 + Math.random() * 500 }))
    },
    networkHealth: {
        difficulty: 25000000000000,
        hash_rate: 180000000000000,
        n_blocks_total: 700000,
        n_tx_total: 800000000,
        estimatefee: 100000
    },
    blockTime: { minutes_between_blocks: 9.8 }
};

// Update price ticker (CoinGecko - Top 5 by market cap)
async function updatePriceTicker() {
    const data = await fetchData(`${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false`);
    const tickerList = document.getElementById("ticker-list");
    const displayData = data && data.length > 0 ? data : mockData.priceTicker;
    tickerList.innerHTML = displayData.map(coin => `
        <div class="card">
            <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
            <p>$${coin.current_price.toLocaleString()}</p>
            <p class="${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                ${coin.price_change_percentage_24h.toFixed(2)}%
            </p>
            <p>Volume: $${coin.total_volume.toLocaleString()}</p>
        </div>
    `).join("");
}

// Update trending coins (CoinGecko - Trending search)
async function updateTrendingCoins() {
    const data = await fetchData(`${COINGECKO_API}/search/trending`);
    const trendingList = document.getElementById("trending-list");
    const displayData = data && data.coins && data.coins.length > 0 ? data.coins : mockData.trendingCoins;
    trendingList.innerHTML = displayData.slice(0, 5).map(coin => `
        <div class="card">
            <h3>${coin.item.name} (${coin.item.symbol.toUpperCase()})</h3>
            <p>Market Cap Rank: #${coin.item.market_cap_rank}</p>
            <p>Score: ${coin.item.score}</p>
        </div>
    `).join("");
}

// Update blockchain stats (CoinGecko - Global data with sentiment)
async function updateBlockchainStats() {
    const data = await fetchData(`${COINGECKO_API}/global`);
    const statsContainer = document.getElementById("blockchain-stats");
    const displayData = data && data.data ? data : mockData.blockchainStats;
    const stats = displayData.data;
    const sentiment = stats.market_cap_change_percentage_24h_usd >= 0 ? "Bullish" : "Bearish";
    statsContainer.innerHTML = `
        <div class="card">
            <h3>Active Cryptos</h3>
            <p>${stats.active_cryptocurrencies.toLocaleString()}</p>
        </div>
        <div class="card">
            <h3>Markets</h3>
            <p>${stats.markets.toLocaleString()}</p>
        </div>
        <div class="card">
            <h3>Total Volume (24h)</h3>
            <p>$${stats.total_volume.usd.toLocaleString()}</p>
        </div>
        <div class="card">
            <h3>BTC Dominance</h3>
            <p>${stats.market_cap_percentage.btc.toFixed(2)}%</p>
        </div>
        <div class="card">
            <h3>ETH Dominance</h3>
            <p>${stats.market_cap_percentage.eth.toFixed(2)}%</p>
        </div>
        <div class="card">
            <h3>Market Cap</h3>
            <p>$${stats.total_market_cap.usd.toLocaleString()}</p>
        </div>
        <div class="card">
            <h3>24h Change</h3>
            <p>${stats.market_cap_change_percentage_24h_usd.toFixed(2)}%</p>
        </div>
        <div class="card">
            <h3>Sentiment</h3>
            <p>${sentiment}</p>
        </div>
    `;
}

// Update latest blocks (Blockcypher - Real block data)
async function updateLatestBlocks() {
    const chainData = await fetchData(`${BLOCKCYPHER_API}`);
    const blocksList = document.getElementById("blocks-list");
    if (chainData && chainData.height) {
        let blocksHTML = "";
        const latestHeight = chainData.height;

        for (let i = 0; i < 5; i++) {
            const blockHeight = latestHeight - i;
            const blockData = await fetchData(`${BLOCKCYPHER_API}/blocks/${blockHeight}`);
            const displayBlock = blockData || mockData.latestBlocks[0];
            blocksHTML += `
                <div class="card">
                    <h3>Block #${displayBlock.height}</h3>
                    <p>Time: ${new Date(displayBlock.time).toLocaleTimeString()}</p>
                    <p>Txs: ${displayBlock.n_tx}</p>
                    <p>Size: ${(displayBlock.size / 1024).toFixed(2)} KB</p>
                    <p>Reward: ${(displayBlock.total / 1e8 - displayBlock.fee / 1e8).toFixed(4)} BTC</p>
                    <p>Fee: ${(displayBlock.fee / 1e8).toFixed(6)} BTC</p>
                    <p>Hash: ${displayBlock.hash.slice(0, 10)}...</p>
                </div>
            `;
        }
        blocksList.innerHTML = blocksHTML;
    } else {
        blocksList.innerHTML = mockData.latestBlocks.map(block => `
            <div class="card">
                <h3>Block #${block.height}</h3>
                <p>Time: ${new Date(block.time).toLocaleTimeString()}</p>
                <p>Txs: ${block.n_tx}</p>
                <p>Size: ${(block.size / 1024).toFixed(2)} KB</p>
                <p>Reward: ${(block.total / 1e8 - block.fee / 1e8).toFixed(4)} BTC</p>
                <p>Fee: ${(block.fee / 1e8).toFixed(6)} BTC</p>
                <p>Hash: ${block.hash.slice(0, 10)}...</p>
            </div>
        `).join("");
    }
}

// Update latest transactions (Blockcypher - Unconfirmed transactions)
async function updateLatestTransactions() {
    const data = await fetchData(`${BLOCKCYPHER_API}/txs`);
    const transactionsList = document.getElementById("transactions-list");
    const displayData = data && data.length > 0 ? data : mockData.latestTransactions;
    transactionsList.innerHTML = displayData.slice(0, 5).map(tx => `
        <div class="card">
            <h3>Transaction</h3>
            <p>Hash: ${tx.hash.slice(0, 10)}...</p>
            <p>Amount: ${(tx.total / 1e8).toFixed(4)} BTC</p>
            <p>Fee: ${(tx.fees / 1e8).toFixed(6)} BTC</p>
            <p>Time: ${new Date(tx.received).toLocaleTimeString()}</p>
            <p>Inputs: ${tx.inputs.length}</p>
            <p>Outputs: ${tx.outputs.length}</p>
        </div>
    `).join("");
}

// Update dark pool transactions (Blockcypher - High-value unconfirmed txs)
async function updateDarkPoolTransactions() {
    const data = await fetchData(`${BLOCKCYPHER_API}/txs`);
    const darkPoolList = document.getElementById("dark-pool-list");
    if (data && data.length > 0) {
        const highValueTxs = data.filter(tx => (tx.total / 1e8) > 1).slice(0, 5);
        darkPoolList.innerHTML = highValueTxs.length > 0 ? highValueTxs.map(tx => `
            <div class="card">
                <h3>Large Transaction</h3>
                <p>Hash: ${tx.hash.slice(0, 10)}...</p>
                <p>Amount: ${(tx.total / 1e8).toFixed(4)} BTC</p>
                <p>Fee: ${(tx.fees / 1e8).toFixed(6)} BTC</p>
                <p>Time: ${new Date(tx.received).toLocaleTimeString()}</p>
            </div>
        `).join("") : "<p>No significant unconfirmed transactions.</p>";
    } else {
        darkPoolList.innerHTML = mockData.latestTransactions.filter(tx => (tx.total / 1e8) > 1).slice(0, 5).map(tx => `
            <div class="card">
                <h3>Large Transaction</h3>
                <p>Hash: ${tx.hash.slice(0, 10)}...</p>
                <p>Amount: ${(tx.total / 1e8).toFixed(4)} BTC</p>
                <p>Fee: ${(tx.fees / 1e8).toFixed(6)} BTC</p>
                <p>Time: ${new Date(tx.received).toLocaleTimeString()}</p>
            </div>
        `).join("");
    }
}

// Handle search (CoinGecko - Detailed coin data)
async function handleSearch() {
    const searchTerm = document.getElementById("search-input").value.trim().toLowerCase();
    const resultsContainer = document.getElementById("results-container");
    if (!searchTerm) {
        resultsContainer.innerHTML = "<p>Please enter a coin ID (e.g., bitcoin).</p>";
        return;
    }

    resultsContainer.innerHTML = "<p>Searching...</p>";
    const data = await fetchData(`${COINGECKO_API}/coins/${searchTerm}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
    if (data && !data.error) {
        resultsContainer.innerHTML = `
            <div class="card">
                <h3>${data.name} (${data.symbol.toUpperCase()})</h3>
                <p>Price: $${data.market_data.current_price.usd.toLocaleString()}</p>
                <p>Market Cap: $${data.market_data.market_cap.usd.toLocaleString()}</p>
                <p>24h Change: ${data.market_data.price_change_percentage_24h.toFixed(2)}%</p>
                <p>24h Volume: $${data.market_data.total_volume.usd.toLocaleString()}</p>
                <p>ATH: $${data.market_data.ath.usd.toLocaleString()}</p>
                <p>Circulating Supply: ${data.market_data.circulating_supply.toLocaleString()}</p>
                <p>Rank: #${data.market_cap_rank}</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = "<p>No results found. Try 'bitcoin' or 'ethereum'.</p>";
    }
}

// Simulate loading with progress bar
function simulateLoading() {
    const progress = document.querySelector(".progress");
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            document.getElementById("loading-overlay").style.opacity = "0";
            setTimeout(() => document.getElementById("loading-overlay").style.display = "none", 500);
        } else {
            width += 5;
            progress.style.width = width + "%";
        }
    }, 100);
}

// Transaction volume chart (Blockchain.info - Real 24h data)
async function updateTransactionChart() {
    const data = await fetchData(`${BLOCKCHAIN_API}/charts/n-transactions?timespan=24hours&format=json`, false); // No proxy for this endpoint
    const chartContainer = document.getElementById("transactionChart").parentElement;
    const displayData = data && data.values ? data : mockData.transactionChart;
    const ctx = document.getElementById("transactionChart").getContext("2d");
    const labels = displayData.values.map(v => new Date(v.x * 1000).toLocaleTimeString());
    const txData = displayData.values.map(v => v.y);

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Txs", data: txData, borderColor: "#00d4ff", backgroundColor: "rgba(0, 212, 255, 0.1)", fill: true }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Transactions", color: "#00d4ff" }, grid: { color: "rgba(0, 212, 255, 0.05)" }, ticks: { color: "#e0e0e0" } },
                x: { title: { display: true, text: "Time (24h)", color: "#e0e0e0" }, grid: { color: "rgba(0, 212, 255, 0.05)" }, ticks: { color: "#e0e0e0" } }
            },
            plugins: { tooltip: { mode: "index", intersect: false }, legend: { position: "top", labels: { color: "#e0e0e0" } } }
        }
    });
}

// Network health (Blockchain.info - Real-time stats with fee rate)
async function updateNetworkHealth() {
    const statsData = await fetchData(`${BLOCKCHAIN_API}/stats`, false);
    const mempoolData = await fetchData(`${BLOCKCHAIN_API}/q/mempoolsize`, false);
    const feeRateData = await fetchData(`${BLOCKCHAIN_API}/q/estimatefee?nbBlocks=2`, false);
    const networkContainer = document.getElementById("network-health");
    if (statsData) {
        networkContainer.innerHTML = `
            <div class="card">
                <h3>Difficulty</h3>
                <p>${(statsData.difficulty / 1e12).toFixed(2)} T</p>
            </div>
            <div class="card">
                <h3>Hash Rate</h3>
                <p>${(statsData.hash_rate / 1e12).toFixed(2)} TH/s</p>
            </div>
            <div class="card">
                <h3>Mempool Size</h3>
                <p>${mempoolData ? mempoolData.toLocaleString() : 'N/A'} KB</p>
            </div>
            <div class="card">
                <h3>Total Blocks</h3>
                <p>${statsData.n_blocks_total.toLocaleString()}</p>
            </div>
            <div class="card">
                <h3>Total Txs</h3>
                <p>${statsData.n_tx_total.toLocaleString()}</p>
            </div>
            <div class="card">
                <h3>Fee Rate (2 blocks)</h3>
                <p>${feeRateData ? (feeRateData / 1e8).toFixed(8) : 'N/A'} BTC/KB</p>
            </div>
        `;
    } else {
        const mockStats = mockData.networkHealth;
        networkContainer.innerHTML = `
            <div class="card">
                <h3>Difficulty</h3>
                <p>${(mockStats.difficulty / 1e12).toFixed(2)} T</p>
            </div>
            <div class="card">
                <h3>Hash Rate</h3>
                <p>${(mockStats.hash_rate / 1e12).toFixed(2)} TH/s</p>
            </div>
            <div class="card">
                <h3>Mempool Size</h3>
                <p>N/A</p>
            </div>
            <div class="card">
                <h3>Total Blocks</h3>
                <p>${mockStats.n_blocks_total.toLocaleString()}</p>
            </div>
            <div class="card">
                <h3>Total Txs</h3>
                <p>${mockStats.n_tx_total.toLocaleString()}</p>
            </div>
            <div class="card">
                <h3>Fee Rate (2 blocks)</h3>
                <p>${mockStats.estimatefee ? (mockStats.estimatefee / 1e8).toFixed(8) : 'N/A'} BTC/KB</p>
            </div>
        `;
    }
}

// Block time tracker (Blockchain.info - Average block time)
async function updateBlockTimeTracker() {
    const statsData = await fetchData(`${BLOCKCHAIN_API}/stats`, false);
    const blockTimeList = document.getElementById("block-time-list");
    const displayData = statsData || mockData.blockTime;
    const avgBlockTime = displayData.minutes_between_blocks;
    const confirmationEstimate = avgBlockTime * 2;
    blockTimeList.innerHTML = `
        <div class="card">
            <h3>Avg Block Time</h3>
            <p>${avgBlockTime.toFixed(2)} min</p>
        </div>
        <div class="card">
            <h3>2-Block Confirmation</h3>
            <p>${confirmationEstimate.toFixed(2)} min</p>
        </div>
    `;
}

// Export data to JSON
function exportData() {
    const sections = ['ticker-list', 'trending-list', 'blockchain-stats', 'blocks-list', 'transactions-list', 'network-health', 'block-time-list', 'dark-pool-list'];
    const exportData = {};

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const cards = Array.from(section.getElementsByClassName('card'));
            exportData[sectionId] = cards.map(card => {
                const title = card.querySelector('h3')?.textContent || '';
                const paragraphs = Array.from(card.getElementsByTagName('p')).map(p => p.textContent);
                return { title, data: paragraphs };
            });
        }
    });

    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blockchain_monitor_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize app
async function initApp() {
    simulateLoading();
    await Promise.all([
        updatePriceTicker(),
        updateTrendingCoins(),
        updateBlockchainStats(),
        updateLatestBlocks(),
        updateLatestTransactions(),
        updateTransactionChart(),
        updateNetworkHealth(),
        updateBlockTimeTracker(),
        updateDarkPoolTransactions()
    ]);

    // Update last update timestamp
    document.getElementById("last-update").textContent = new Date().toLocaleTimeString();

    // Event listeners
    document.getElementById("search-button").addEventListener("click", handleSearch);
    document.getElementById("search-input").addEventListener("keypress", e => {
        if (e.key === "Enter") handleSearch();
    });
    document.getElementById("export-button").addEventListener("click", exportData);

    // Periodic updates with staggered timing to avoid rate limits
    setInterval(async () => {
        await updatePriceTicker();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await updateTrendingCoins();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await updateLatestBlocks();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await updateLatestTransactions();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await updateNetworkHealth();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await updateBlockTimeTracker();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await updateDarkPoolTransactions();
        document.getElementById("last-update").textContent = new Date().toLocaleTimeString();
    }, 60000); // Update every minute
}

window.addEventListener("load", initApp);