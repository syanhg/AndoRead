const API_BASE = '/api';
let allEvents = [];
let filteredEvents = [];
let currentTagId = null;

async function init() {
    await loadTags();
    await loadMarkets();
    setupEventListeners();
}

async function loadTags() {
    try {
        const response = await fetch(`${API_BASE}/tags?limit=100`);
        const tags = await response.json();
        const topicFilter = document.getElementById('topicFilter');
        
        if (Array.isArray(tags)) {
            tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.id;
                option.textContent = tag.label;
                topicFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading tags:', error);
    }
}

async function loadMarkets() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const container = document.getElementById('marketsContainer');
    
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    error.textContent = '';
    container.innerHTML = '';
    
    try {
        const isLive = document.getElementById('statusToggle').checked;
        const tagId = document.getElementById('topicFilter').value || currentTagId;
        
        let url = `${API_BASE}/events?limit=100`;
        
        if (isLive) {
            url += `&active=true&closed=false`;
        } else {
            url += `&closed=true`;
        }
        
        if (tagId) {
            url += `&tag_id=${tagId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        allEvents = Array.isArray(data) ? data : [];
        
        if (allEvents.length === 0) {
            error.textContent = 'No markets found. Try different filters.';
            error.classList.remove('hidden');
            loading.classList.add('hidden');
            return;
        }
        
        filteredEvents = [...allEvents];
        applyFilters();
        renderMarkets();
        
    } catch (err) {
        console.error('Fetch error:', err);
        error.textContent = `Unable to load markets. ${err.message}`;
        error.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredEvents = allEvents.filter(event => {
        const matchesSearch = !searchTerm || 
            event.title?.toLowerCase().includes(searchTerm) ||
            event.description?.toLowerCase().includes(searchTerm) ||
            event.slug?.toLowerCase().includes(searchTerm);
        
        return matchesSearch;
    });
    
    const sortBy = document.getElementById('sortBy').value;
    const orderBy = document.getElementById('orderBy').value;
    
    filteredEvents.sort((a, b) => {
        let aVal, bVal;
        
        switch(sortBy) {
            case 'volume24hr':
                aVal = parseFloat(a.volume24hr || 0);
                bVal = parseFloat(b.volume24hr || 0);
                break;
            case 'volume':
                aVal = parseFloat(a.volume || 0);
                bVal = parseFloat(b.volume || 0);
                break;
            case 'liquidity':
                aVal = parseFloat(a.liquidity || 0);
                bVal = parseFloat(b.liquidity || 0);
                break;
            case 'new':
                aVal = new Date(a.createdAt || a.startDate || 0).getTime();
                bVal = new Date(b.createdAt || b.startDate || 0).getTime();
                break;
            default:
                return 0;
        }
        
        return orderBy === 'desc' ? bVal - aVal : aVal - bVal;
    });
}

function renderMarkets() {
    const container = document.getElementById('marketsContainer');
    const error = document.getElementById('error');
    container.innerHTML = '';
    error.classList.add('hidden');
    
    if (filteredEvents.length === 0) {
        error.textContent = 'No markets match your search criteria';
        error.classList.remove('hidden');
        return;
    }
    
    filteredEvents.forEach(event => {
        const card = createMarketCard(event);
        container.appendChild(card);
    });
}

function createMarketCard(event) {
    const card = document.createElement('div');
    card.className = 'group cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md';
    
    const markets = event.markets || [];
    const mainMarket = markets[0] || {};
    
    let outcomes = [];
    let prices = [];
    
    try {
        if (typeof mainMarket.outcomes === 'string') {
            outcomes = JSON.parse(mainMarket.outcomes);
        } else if (Array.isArray(mainMarket.outcomes)) {
            outcomes = mainMarket.outcomes;
        }
        
        if (typeof mainMarket.outcomePrices === 'string') {
            prices = JSON.parse(mainMarket.outcomePrices);
        } else if (Array.isArray(mainMarket.outcomePrices)) {
            prices = mainMarket.outcomePrices;
        }
    } catch (e) {
        console.error('Error parsing outcomes:', e);
    }
    
    if (outcomes.length === 0) {
        outcomes = ['Yes', 'No'];
        prices = ['0.50', '0.50'];
    }
    
    const predictions = outcomes.slice(0, 2).map((outcome, i) => ({
        outcome,
        price: parseFloat(prices[i] || 0)
    })).sort((a, b) => b.price - a.price);
    
    const imageUrl = event.image || mainMarket.image || '';
    const isLive = event.active && !event.closed;
    const endDate = new Date(event.endDate || mainMarket.endDate);
    const closeText = isLive ? 
        `Closes ${formatDate(endDate)}` : 
        `Closed ${formatDate(endDate)}`;
    
    const volume = formatCurrency(event.volume || 0);
    const volume24hr = formatCurrency(event.volume24hr || 0);
    const liquidity = formatCurrency(event.liquidity || 0);
    const numMarkets = markets.length || 1;
    
    card.innerHTML = `
        <div class="relative h-48 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-primary/5">
            ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(event.title)}" class="h-full w-full object-cover" onerror="this.style.display='none'">` : ''}
        </div>
        <div class="p-6">
            <h3 class="mb-4 line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors">${escapeHtml(event.title)}</h3>
            
            <div class="mb-4 grid grid-cols-2 gap-3">
                <div class="rounded-md border bg-muted/50 p-2">
                    <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Volume</div>
                    <div class="mt-1 text-sm font-semibold">${volume}</div>
                </div>
                <div class="rounded-md border bg-muted/50 p-2">
                    <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">24h Vol</div>
                    <div class="mt-1 text-sm font-semibold">${volume24hr}</div>
                </div>
                <div class="rounded-md border bg-muted/50 p-2">
                    <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Liquidity</div>
                    <div class="mt-1 text-sm font-semibold">${liquidity}</div>
                </div>
                <div class="rounded-md border bg-muted/50 p-2">
                    <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Markets</div>
                    <div class="mt-1 text-sm font-semibold">${numMarkets}</div>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="mb-2 text-xs font-medium text-muted-foreground">Top Predictions</div>
                <div class="space-y-2">
                    ${predictions.map(p => `
                        <div class="flex items-center justify-between rounded-md border bg-muted/30 p-2">
                            <div>
                                <div class="text-sm font-medium">${escapeHtml(p.outcome)}</div>
                                <div class="text-xs text-muted-foreground">Market Price</div>
                            </div>
                            <div class="text-sm font-semibold">${(p.price * 100).toFixed(0)}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="flex items-center justify-between border-t pt-4">
                <span class="inline-flex items-center gap-2 rounded-full ${isLive ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'} px-2.5 py-0.5 text-xs font-medium">
                    <span class="h-1.5 w-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}"></span>
                    ${isLive ? 'LIVE' : 'CLOSED'}
                </span>
                <span class="text-xs text-muted-foreground">${closeText}</span>
            </div>
        </div>
    `;
    
    // MODIFIED: Navigate to detail page instead of external link
    card.addEventListener('click', () => {
        navigateToDetailPage(event);
    });
    
    return card;
}

function navigateToDetailPage(event) {
    // Store event data in localStorage for detail page
    const eventData = {
        title: event.title,
        slug: event.slug,
        closeDate: formatDate(new Date(event.endDate)),
        volume: formatCurrency(event.volume || 0),
        volume24h: formatCurrency(event.volume24hr || 0),
        liquidity: formatCurrency(event.liquidity || 0),
        image: event.image,
        active: event.active,
        closed: event.closed
    };
    
    localStorage.setItem('currentEvent', JSON.stringify(eventData));
    
    // Navigate to detail page
    window.location.href = `event-detail.html?event=${event.slug}`;
}

function formatCurrency(value) {
    const num = parseFloat(value);
    if (num >= 1000000) {
        return '$' + (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return '$' + (num / 1000).toFixed(1) + 'K';
    } else {
        return '$' + num.toFixed(0);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    if (days === 0) {
        return 'today';
    } else if (days === 1) {
        return 'tomorrow';
    } else if (days < 30) {
        return `in ${days} days`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    
    searchInput.addEventListener('focus', () => {
        searchDropdown.classList.add('active');
    });
    
    searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
        searchDropdown.classList.add('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.browse-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const sortValue = option.dataset.sort;
            
            if (sortValue === 'new') {
                document.getElementById('sortBy').value = 'new';
                document.getElementById('orderBy').value = 'desc';
            } else if (sortValue === 'competitive') {
                document.getElementById('sortBy').value = 'liquidity';
                document.getElementById('orderBy').value = 'desc';
            } else {
                document.getElementById('sortBy').value = sortValue;
                document.getElementById('orderBy').value = 'desc';
            }
            
            searchDropdown.classList.remove('active');
            applyFilters();
            renderMarkets();
        });
    });
    
    document.querySelectorAll('.nav-tab').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-tab').forEach(i => {
                i.classList.remove('active', 'border-primary', 'text-foreground');
                i.classList.add('border-transparent', 'text-muted-foreground');
            });
            item.classList.add('active', 'border-primary', 'text-foreground');
            item.classList.remove('border-transparent', 'text-muted-foreground');
            
            const tagId = item.dataset.tag;
            const category = item.dataset.category;
            
            if (category === 'all') {
                currentTagId = null;
                document.getElementById('topicFilter').value = '';
            } else if (tagId) {
                currentTagId = tagId;
                document.getElementById('topicFilter').value = tagId;
            }
            
            loadMarkets();
        });
    });
    
    searchInput.addEventListener('input', () => {
        applyFilters();
        renderMarkets();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchDropdown.classList.remove('active');
            applyFilters();
            renderMarkets();
        }
    });
    
    document.getElementById('topicFilter').addEventListener('change', (e) => {
        currentTagId = e.target.value;
        
        document.querySelectorAll('.nav-item').forEach(item => {
            if (currentTagId && item.dataset.tag === currentTagId) {
                item.classList.add('active');
                document.querySelectorAll('.nav-item').forEach(i => {
                    if (i !== item) i.classList.remove('active');
                });
            } else if (!currentTagId && item.dataset.category === 'all') {
                item.classList.add('active');
                document.querySelectorAll('.nav-item').forEach(i => {
                    if (i !== item) i.classList.remove('active');
                });
            }
        });
        
        loadMarkets();
    });
    
    document.getElementById('statusToggle').addEventListener('change', () => {
        loadMarkets();
    });
    
    document.getElementById('sortBy').addEventListener('change', () => {
        applyFilters();
        renderMarkets();
    });
    
    document.getElementById('orderBy').addEventListener('change', () => {
        applyFilters();
        renderMarkets();
    });
}

init();
