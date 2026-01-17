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
    card.className = 'group card-hover cursor-pointer rounded-lg border border-border/50 bg-card text-card-foreground shadow-sm transition-all hover:border-border hover:shadow-md';
    
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
        <div class="relative h-40 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(event.title)}" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onerror="this.style.display='none'">` : ''}
            <div class="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
            <div class="absolute top-3 right-3">
                <span class="inline-flex items-center gap-1.5 rounded-full ${isLive ? 'bg-green-500/90 text-white backdrop-blur-sm' : 'bg-muted/90 text-muted-foreground backdrop-blur-sm'} px-2 py-0.5 text-[10px] font-medium shadow-sm">
                    <span class="h-1.5 w-1.5 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-current'}"></span>
                    ${isLive ? 'LIVE' : 'CLOSED'}
                </span>
            </div>
        </div>
        <div class="p-5">
            <h3 class="mb-3 line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary transition-colors">${escapeHtml(event.title)}</h3>
            
            <div class="mb-4 grid grid-cols-2 gap-2.5">
                <div class="stat-card rounded-md border border-border/50 bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <div class="stat-label mb-1">Volume</div>
                    <div class="stat-value text-base">${volume}</div>
                </div>
                <div class="stat-card rounded-md border border-border/50 bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <div class="stat-label mb-1">24h Vol</div>
                    <div class="stat-value text-base">${volume24hr}</div>
                </div>
                <div class="stat-card rounded-md border border-border/50 bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <div class="stat-label mb-1">Liquidity</div>
                    <div class="stat-value text-base">${liquidity}</div>
                </div>
                <div class="stat-card rounded-md border border-border/50 bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <div class="stat-label mb-1">Markets</div>
                    <div class="stat-value text-base">${numMarkets}</div>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="mb-2 flex items-center justify-between">
                    <span class="text-xs font-medium text-muted-foreground">Top Predictions</span>
                    <span class="text-[10px] text-muted-foreground/70">Market Price</span>
                </div>
                <div class="space-y-1.5">
                    ${predictions.map(p => `
                        <div class="table-row-hover flex items-center justify-between rounded-md border border-border/30 bg-muted/20 p-2 transition-colors hover:bg-muted/40">
                            <div class="flex items-center gap-2">
                                <div class="h-1.5 w-1.5 rounded-full bg-primary/60"></div>
                                <div>
                                    <div class="text-sm font-medium">${escapeHtml(p.outcome)}</div>
                                </div>
                            </div>
                            <div class="text-sm font-semibold tabular-nums">${(p.price * 100).toFixed(0)}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="flex items-center justify-between border-t border-border/50 pt-3.5">
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>${closeText}</span>
                </div>
                <div class="flex items-center gap-1 text-xs text-muted-foreground/70">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>View Details</span>
                </div>
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
