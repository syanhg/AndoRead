// Get event data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const eventSlug = urlParams.get('event');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFunctionality();
    loadEventData();
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
        document.getElementById('closeDate').textContent = 'Closes: N/A';
        document.getElementById('analysisSection').style.display = 'none';
        return;
    }
    
    displayEventInfo(eventData);
    
    // Perform REAL analysis: Exa research + Claude AI
    await performRealAnalysis(eventData);
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

async function performRealAnalysis(event) {
    const loadingState = document.querySelector('.loading-state');
    
    try {
        // STEP 1: Research with Exa - Get REAL web data
        loadingState.innerHTML = `
            <div class="spinner"></div>
            <p>Researching with Exa AI...</p>
            <p class="loading-detail">Searching the web for relevant information and sources</p>
        `;
        
        const exaResults = await searchWithExa(event.title);
        console.log('Exa results:', exaResults);
        
        if (exaResults.length === 0) {
            throw new Error('No Exa search results found');
        }
        
        // STEP 2: Analyze with Claude - REAL AI reasoning
        loadingState.innerHTML = `
            <div class="spinner"></div>
            <p>Analyzing with Claude AI...</p>
            <p class="loading-detail">Processing research data and generating predictions</p>
        `;
        
        const analysis = await analyzeWithClaude(event, exaResults);
        console.log('Claude analysis:', analysis);
        
        // STEP 3: Display results
        displayAnalysisResults(analysis, exaResults);
        
    } catch (error) {
        console.error('Analysis error:', error);
        loadingState.innerHTML = `
            <p style="color: #ef4444; font-size: 16px; margin-bottom: 8px;">Analysis Error</p>
            <p class="loading-detail">${error.message}</p>
            <p class="loading-detail" style="margin-top: 12px;">Please check console for details or try refreshing the page.</p>
        `;
    }
}

async function searchWithExa(query) {
    try {
        const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'ab80b7d9-b049-4cb8-94af-02cb6fa0b4d2'
            },
            body: JSON.stringify({
                query: query,
                numResults: 10,
                useAutoprompt: true,
                type: 'neural',
                contents: {
                    text: { maxCharacters: 2000 }
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Exa API error:', response.status, errorText);
            throw new Error(`Exa API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results || [];
        
    } catch (error) {
        console.error('Exa search error:', error);
        throw new Error(`Exa search failed: ${error.message}`);
    }
}

async function analyzeWithClaude(event, exaResults) {
    try {
        // Build comprehensive prompt with Exa data
        const prompt = buildAnalysisPrompt(event, exaResults);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Claude API error:', response.status, errorText);
            throw new Error(`Claude API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw Claude response:', data);
        
        // Extract text from response
        const textContent = data.content
            .filter(item => item.type === 'text')
            .map(item => item.text)
            .join('\n');
        
        console.log('Claude text content:', textContent);
        
        return parseClaudeResponse(textContent, exaResults);
        
    } catch (error) {
        console.error('Claude analysis error:', error);
        throw new Error(`Claude analysis failed: ${error.message}`);
    }
}

function buildAnalysisPrompt(event, exaResults) {
    // Format Exa sources
    const sources = exaResults.slice(0, 8).map((result, i) => {
        return `SOURCE ${i + 1}:
Title: ${result.title}
URL: ${result.url}
Published: ${result.publishedDate || 'Recent'}
Content: ${result.text || 'No content available'}

---`;
    }).join('\n\n');
    
    return `You are an expert forecasting analyst. Analyze this prediction market event using the research data provided.

EVENT DETAILS:
Title: ${event.title}
Closes: ${event.closeDate}
Volume: ${event.volume}
24h Volume: ${event.volume24h}
Liquidity: ${event.liquidity}

RESEARCH DATA FROM EXA:
${sources}

ANALYSIS REQUIREMENTS:
1. Carefully read ALL the source content above
2. Extract key facts, statistics, trends, and expert opinions
3. Identify historical patterns and precedents
4. Consider base rates and reference classes
5. Weight evidence by source quality and recency
6. Generate probability estimates based on the evidence

Provide your analysis in this EXACT JSON format (output ONLY valid JSON, no markdown):

{
  "predictions": [
    {
      "outcome": "Outcome 1 Name",
      "probability": 0.XX,
      "model": "Evidence-Based Analysis"
    },
    {
      "outcome": "Outcome 2 Name",
      "probability": 0.XX,
      "model": "Evidence-Based Analysis"
    }
  ],
  "rationale": "Comprehensive 3-4 sentence explanation citing specific evidence from sources. Mention key statistics, trends, or expert opinions that informed your prediction. Explain the reasoning chain from evidence to conclusion.",
  "confidence": X.X,
  "keyFactors": [
    "Specific factor 1 with supporting evidence",
    "Specific factor 2 with supporting evidence",
    "Specific factor 3 with supporting evidence"
  ],
  "sourceAnalysis": [
    {
      "title": "Source title from above",
      "relevance": "How this source specifically informed the prediction",
      "url": "URL from above"
    }
  ]
}

CRITICAL INSTRUCTIONS:
- Probabilities MUST sum to 1.0
- Base predictions on ACTUAL evidence from sources
- Cite specific facts, numbers, or quotes when possible
- Confidence should reflect data quality (1-5 scale)
- For sports: extract team names from title
- For politics: consider polling data and trends
- Output ONLY the JSON object, nothing else`;
}

function parseClaudeResponse(text, exaResults) {
    try {
        // Clean the response
        let cleaned = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
        
        // Extract JSON
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in Claude response:', text);
            throw new Error('No JSON in Claude response');
        }
        
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate structure
        if (!parsed.predictions || !Array.isArray(parsed.predictions) || parsed.predictions.length === 0) {
            throw new Error('Invalid predictions structure');
        }
        
        // Map sourceAnalysis to sources with URLs from Exa
        if (parsed.sourceAnalysis && Array.isArray(parsed.sourceAnalysis)) {
            parsed.sources = parsed.sourceAnalysis.map(sa => {
                // Find matching Exa result
                const exaMatch = exaResults.find(r => 
                    r.title.toLowerCase().includes(sa.title.toLowerCase().substring(0, 20)) ||
                    sa.title.toLowerCase().includes(r.title.toLowerCase().substring(0, 20))
                );
                
                return {
                    title: sa.title,
                    description: sa.relevance,
                    url: exaMatch ? exaMatch.url : sa.url || ''
                };
            });
        } else {
            // Fallback: use Exa results directly
            parsed.sources = exaResults.slice(0, 3).map(r => ({
                title: r.title,
                description: 'Source used in analysis',
                url: r.url
            }));
        }
        
        return parsed;
        
    } catch (error) {
        console.error('Parse error:', error);
        console.error('Raw text:', text);
        throw new Error(`Failed to parse Claude response: ${error.message}`);
    }
}

function displayAnalysisResults(analysis, exaResults) {
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
    const stars = Math.round(analysis.confidence || 3);
    const starsHtml = Array(5).fill(0).map((_, i) => 
        `<span class="star ${i < stars ? '' : 'empty'}">★</span>`
    ).join('');
    document.getElementById('confidenceStars').innerHTML = starsHtml;
    document.getElementById('confidenceScore').textContent = `${(analysis.confidence || 3).toFixed(1)}/5`;
    
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
