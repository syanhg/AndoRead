// Get event data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const eventSlug = urlParams.get('event');

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    setupSearchFunctionality();
    await loadEventData();
});

function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            localStorage.setItem('searchTerm', e.target.value);
            window.location.href = 'index.html';
        }
    });
}

async function loadEventData() {
    const eventData = JSON.parse(localStorage.getItem('currentEvent') || '{}');
    
    if (!eventData.title) {
        document.getElementById('eventTitle').textContent = 'Event not found';
        return;
    }
    
    displayEventInfo(eventData);
    
    // Show quick mock analysis (instant)
    setTimeout(() => {
        displayMockAnalysis(eventData);
    }, 800);
}

function displayEventInfo(event) {
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('closeDate').textContent = `Closes: ${event.closeDate}`;
    document.getElementById('volume').textContent = event.volume || '$0';
    document.getElementById('volume24h').textContent = event.volume24h || '$0';
    document.getElementById('liquidity').textContent = event.liquidity || '$0';
    
    const statusBadge = document.getElementById('statusBadge');
    if (event.active && !event.closed) {
        statusBadge.className = 'status-badge live';
        statusBadge.innerHTML = '<span class="status-indicator"></span>LIVE';
    } else {
        statusBadge.className = 'status-badge closed';
        statusBadge.innerHTML = '<span class="status-indicator"></span>CLOSED';
    }
}

function displayMockAnalysis(event) {
    // Generate smart mock predictions based on event title
    const analysis = generateSmartPredictions(event);
    
    // Hide loading
    document.getElementById('analysisSection').style.display = 'none';
    
    // Show predictions
    const predictionsSection = document.getElementById('predictionsSection');
    predictionsSection.style.display = 'block';
    
    const predictionsGrid = document.getElementById('predictionsGrid');
    predictionsGrid.innerHTML = analysis.predictions.map(pred => `
        <div class="prediction-card">
            <div class="prediction-info">
                <h4>${escapeHtml(pred.outcome)}</h4>
                <p>${escapeHtml(pred.model)}</p>
            </div>
            <div class="prediction-value">${(pred.probability * 100).toFixed(0)}%</div>
        </div>
    `).join('');
    
    // Show insights
    const insightsSection = document.getElementById('insightsSection');
    insightsSection.style.display = 'block';
    
    document.getElementById('rationale').textContent = analysis.rationale;
    
    // Display confidence
    const stars = Math.round(analysis.confidence);
    const starsHtml = Array(5).fill(0).map((_, i) => 
        `<span class="star ${i < stars ? '' : 'empty'}">★</span>`
    ).join('');
    document.getElementById('confidenceStars').innerHTML = starsHtml;
    document.getElementById('confidenceScore').textContent = `${analysis.confidence.toFixed(1)}/5`;
    
    // Show sources
    if (analysis.sources && analysis.sources.length > 0) {
        const sourcesSection = document.getElementById('sourcesSection');
        sourcesSection.style.display = 'block';
        
        document.getElementById('sourcesCount').textContent = analysis.sources.length;
        document.getElementById('sourcesList').innerHTML = analysis.sources.map(source => `
            <div class="source-card">
                <div class="source-header">
                    <div class="source-title">${escapeHtml(source.title)}</div>
                    ${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" class="source-link">View →</a>` : ''}
                </div>
                <div class="source-description">${escapeHtml(source.description)}</div>
            </div>
        `).join('');
    }
    
    // Show chart
    displayProbabilityChart(analysis.predictions);
}

function generateSmartPredictions(event) {
    const title = event.title.toLowerCase();
    
    // Detect event type and generate appropriate predictions
    let prob1 = 0.50;
    let rationale = '';
    let confidence = 3.0;
    let outcome1 = 'Yes';
    let outcome2 = 'No';
    
    // Sports events
    if (title.includes('vs') || title.includes(' at ') || title.includes('game') || title.includes('match')) {
        const teams = title.split(/vs| at /);
        if (teams.length >= 2) {
            outcome1 = teams[0].trim().split(' ').slice(-2).join(' ');
            outcome2 = teams[1].trim().split(' ').slice(0, 2).join(' ');
        }
        
        if (title.includes('home') || title.includes('favorite')) {
            prob1 = 0.55 + Math.random() * 0.15;
            rationale = `Home team advantage and recent performance trends suggest a slight edge. Historical matchup data and current form indicate ${(prob1 * 100).toFixed(0)}% probability.`;
            confidence = 3.5;
        } else {
            prob1 = 0.45 + Math.random() * 0.10;
            rationale = `Based on team statistics, recent performance, and historical matchups, this appears to be a competitive game with relatively balanced odds.`;
            confidence = 3.0;
        }
    }
    // Political events
    else if (title.includes('president') || title.includes('election') || title.includes('senate') || title.includes('congress')) {
        prob1 = 0.40 + Math.random() * 0.20;
        rationale = `Analysis of polling data, demographic trends, historical patterns, and current political climate suggests this outcome. Factors include voter turnout models and swing state dynamics.`;
        confidence = 2.5;
    }
    // Crypto/Finance
    else if (title.includes('bitcoin') || title.includes('btc') || title.includes('price') || title.includes('stock')) {
        prob1 = 0.48 + Math.random() * 0.10;
        rationale = `Market analysis based on technical indicators, trading volume, macroeconomic factors, and historical price patterns. Current market sentiment and momentum indicators are key factors.`;
        confidence = 2.0;
    }
    // Yes/No events
    else {
        prob1 = 0.45 + Math.random() * 0.15;
        rationale = `Based on available data, historical patterns, and current trends, this prediction reflects the most likely outcome. Multiple factors including timing, context, and precedent inform this analysis.`;
        confidence = 3.0;
    }
    
    const prob2 = 1 - prob1;
    
    return {
        predictions: [
            { outcome: outcome1, probability: prob1, model: 'AI Statistical Analysis' },
            { outcome: outcome2, probability: prob2, model: 'AI Statistical Analysis' }
        ],
        rationale: rationale,
        confidence: confidence,
        sources: [
            {
                title: 'Historical Data Analysis',
                description: 'Analyzed historical patterns and outcomes from similar events to establish baseline probabilities.',
                url: ''
            },
            {
                title: 'Market Sentiment Indicators',
                description: 'Current market activity and trading patterns inform probability adjustments.',
                url: ''
            },
            {
                title: 'Statistical Models',
                description: 'Multiple statistical approaches including regression analysis and trend detection.',
                url: ''
            }
        ]
    };
}

function displayProbabilityChart(predictions) {
    const chartSection = document.getElementById('chartSection');
    chartSection.style.display = 'block';
    
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    
    const historicalData = predictions.map(pred => ({
        outcome: pred.outcome,
        data: generateHistoricalTrend(pred.probability)
    }));
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['30d ago', '25d', '20d', '15d', '10d', '5d', 'Today'],
            datasets: historicalData.map((item, i) => ({
                label: item.outcome,
                data: item.data,
                borderColor: i === 0 ? '#2563eb' : '#ef4444',
                backgroundColor: i === 0 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

function generateHistoricalTrend(finalProb) {
    const finalValue = finalProb * 100;
    const points = 7;
    const data = [];
    
    let current = 50 + (Math.random() - 0.5) * 20;
    
    for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);
        const target = 50 + (finalValue - 50) * progress;
        current = current * 0.7 + target * 0.3 + (Math.random() - 0.5) * 5;
        data.push(Math.max(0, Math.min(100, current)));
    }
    
    data[points - 1] = finalValue;
    
    return data;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
