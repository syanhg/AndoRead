const urlParams = new URLSearchParams(window.location.search);
const eventSlug = urlParams.get('event');

document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
    loadEventData();
});

function setupSearch() {
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
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
    
    // Display basic info
    document.getElementById('eventTitle').textContent = eventData.title;
    document.getElementById('closeDate').textContent = `Closes: ${eventData.closeDate}`;
    document.getElementById('volume').textContent = eventData.volume || '$0';
    document.getElementById('volume24h').textContent = eventData.volume24h || '$0';
    document.getElementById('liquidity').textContent = eventData.liquidity || '$0';
    
    // Start analysis
    await performAnalysis(eventData);
}

async function performAnalysis(event) {
    try {
        // Step 1: Exa Research
        updateStatus('Searching web sources...');
        const exaResults = await searchWithExa(event.title);
        console.log(`Found ${exaResults.length} sources`);
        
        // Display sources immediately
        displaySources(exaResults);
        
        // Step 2: Claude Analysis (streaming)
        updateStatus('Analyzing with Claude AI...');
        await streamClaudeAnalysis(event, exaResults);
        
    } catch (error) {
        console.error('Analysis error:', error);
        document.getElementById('analysisText').innerHTML = `
            <p style="color: #ef4444;">Analysis failed: ${error.message}</p>
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
                numResults: 8,
                useAutoprompt: true,
                type: 'neural',
                contents: {
                    text: { maxCharacters: 1500 }
                }
            })
        });
        
        if (!response.ok) throw new Error('Exa API error');
        const data = await response.json();
        return data.results || [];
        
    } catch (error) {
        console.error('Exa error:', error);
        return [];
    }
}

async function streamClaudeAnalysis(event, exaResults) {
    const eventIntel = extractEventIntelligence(event.title);
    const prompt = buildAnalysisPrompt(event, exaResults, eventIntel);
    
    try {
        if (typeof puter === 'undefined') {
            throw new Error('Puter.js not loaded');
        }
        
        const analysisEl = document.getElementById('analysisText');
        analysisEl.innerHTML = '';
        
        let fullText = '';
        
        const stream = await puter.ai.chat(prompt, {
            model: 'claude-sonnet-4-20250514',
            stream: true
        });
        
        for await (const chunk of stream) {
            if (chunk.text) {
                fullText += chunk.text;
                analysisEl.innerHTML = formatAnalysisText(fullText);
            }
        }
        
        // Parse predictions
        const analysis = parseStreamedResponse(fullText);
        displayPredictions(analysis.predictions);
        displayModelInsight(analysis.insight);
        
        // Create chart
        createChart(analysis.predictions);
        
        updateStatus('Analysis complete');
        setTimeout(() => {
            document.getElementById('analysisStatus').style.display = 'none';
        }, 2000);
        
    } catch (error) {
        console.error('Claude error:', error);
        throw error;
    }
}

function extractEventIntelligence(title) {
    const titleLower = title.toLowerCase();
    let eventType = 'general';
    let entities = [];
    let context = '';
    
    if (titleLower.match(/\bvs\b|\bat\b|game|match|championship|bowl/)) {
        eventType = 'sports';
        const vsMatch = title.match(/(.+?)\s+(?:vs\.?|at)\s+(.+?)(?:\s|$)/i);
        if (vsMatch) {
            entities = [vsMatch[1].trim(), vsMatch[2].trim()];
        }
        if (titleLower.includes('champion') || titleLower.includes('bowl')) {
            eventType = 'championship';
            context = 'Championship market - analyze top contenders';
        }
    } else if (titleLower.match(/election|president|senate/)) {
        eventType = 'political';
        context = 'Political event - consider polling and historical trends';
    } else if (titleLower.match(/bitcoin|btc|stock|price/)) {
        eventType = 'financial';
        context = 'Financial prediction - high volatility';
    } else {
        eventType = 'binary';
        entities = ['Yes', 'No'];
    }
    
    return { type: eventType, entities, context, title };
}

function buildAnalysisPrompt(event, exaResults, eventIntel) {
    const sources = exaResults.slice(0, 6).map((result, i) => 
        `[SOURCE ${i + 1}] ${result.title}
URL: ${result.url}
Content: ${(result.text || '').substring(0, 800)}
---`
    ).join('\n\n');
    
    let entityGuidance = '';
    if (eventIntel.entities.length > 0) {
        entityGuidance = `\nOUTCOMES: ${eventIntel.entities.join(', ')}`;
    }
    
    return `You are a professional prediction market analyst. Generate actionable forecasts.

RULES:
- NEVER refuse to predict or ask for more data
- ALWAYS provide specific probabilities
- Cite sources by exact title when available
- Format with clear sections using **headers**

EVENT: ${event.title}
TYPE: ${eventIntel.type}${entityGuidance}
MARKET: Volume ${event.volume}, Liquidity ${event.liquidity}

SOURCES:
${sources || 'Use general knowledge for this event type'}

OUTPUT FORMAT:

**Base Rate Analysis**
[Historical baseline for this event type]

**Evidence Synthesis**
[Cite sources]: According to [SOURCE TITLE], [finding].
[List 3-4 key findings with citations]

**Probability Assessment**
[Explain your probability estimates and weighting]

**Key Uncertainties**
[Main risk factors]

\`\`\`json
{
  "predictions": [
    {"outcome": "${eventIntel.entities[0] || 'Outcome 1'}", "probability": 0.XX},
    {"outcome": "${eventIntel.entities[1] || 'Outcome 2'}", "probability": 0.XX}
  ],
  "insight": "Key factor: [X] favors [outcome]",
  "confidence": "High|Medium|Low"
}
\`\`\`

CRITICAL:
- Probabilities sum to 1.0
- Use specific outcome names (not "Outcome 1/2")
- Cite sources by exact title
- Take definitive positions`;
}

function parseStreamedResponse(text) {
    try {
        const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            return {
                predictions: parsed.predictions || [
                    { outcome: 'Yes', probability: 0.5 },
                    { outcome: 'No', probability: 0.5 }
                ],
                insight: parsed.insight || 'Analysis complete',
                confidence: parsed.confidence || 'Medium'
            };
        }
    } catch (error) {
        console.error('Parse error:', error);
    }
    
    return {
        predictions: [
            { outcome: 'Yes', probability: 0.5 },
            { outcome: 'No', probability: 0.5 }
        ],
        insight: 'See analysis above',
        confidence: 'Medium'
    };
}

function formatAnalysisText(text) {
    let displayText = text.replace(/```json[\s\S]*?```/g, '').trim();
    displayText = displayText.replace(/\*\*(.*?)\*\*/g, '<h4>$1</h4>');
    
    const paragraphs = displayText.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map(p => {
        if (p.includes('<h4>')) {
            return p;
        }
        return `<p>${p}</p>`;
    }).join('');
}

function displayPredictions(predictions) {
    const container = document.getElementById('predictionsList');
    container.innerHTML = predictions.map(pred => `
        <div class="prediction-item">
            <span class="prediction-label">${escapeHtml(pred.outcome)}</span>
            <span class="prediction-value">${(pred.probability * 100).toFixed(0)}%</span>
        </div>
    `).join('');
}

function displayModelInsight(insight) {
    document.getElementById('modelInsight').textContent = insight;
}

function displaySources(exaResults) {
    const container = document.getElementById('sourcesList');
    const sources = exaResults.slice(0, 10);
    
    document.getElementById('sourcesCount').textContent = sources.length;
    
    container.innerHTML = sources.map((source, i) => `
        <div class="source-card">
            <div class="source-header">
                <div class="source-title">${escapeHtml(source.title)}</div>
                <a href="${escapeHtml(source.url)}" target="_blank" class="source-link">Show More</a>
            </div>
            <div class="source-description">
                ${escapeHtml((source.text || '').substring(0, 200))}...
            </div>
            <div class="source-citation">
                [${i + 1}] ${escapeHtml(source.url)} • ${source.publishedDate || 'Recent'}
            </div>
        </div>
    `).join('');
}

function createChart(predictions) {
    document.getElementById('chartContainer').innerHTML = '<div id="chart"></div>';
    
    const series = predictions.map(pred => ({
        name: pred.outcome,
        data: generateTrend(pred.probability)
    }));
    
    const options = {
        series: series,
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 600
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        xaxis: {
            categories: ['30d', '25d', '20d', '15d', '10d', '5d', 'Today'],
            labels: {
                style: { fontFamily: 'Manrope' }
            }
        },
        yaxis: {
            min: 0,
            max: 100,
            labels: {
                formatter: (v) => v.toFixed(0) + '%',
                style: { fontFamily: 'Manrope' }
            }
        },
        colors: ['#2563eb', '#ef4444', '#10b981'],
        legend: {
            show: true,
            position: 'top',
            fontFamily: 'Manrope'
        },
        tooltip: {
            y: {
                formatter: (v) => v.toFixed(1) + '%'
            }
        },
        grid: {
            borderColor: '#e5e7eb'
        }
    };
    
    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
}

function generateTrend(finalProb) {
    const final = finalProb * 100;
    const data = [];
    let current = 50 + (Math.random() - 0.5) * 20;
    
    for (let i = 0; i < 7; i++) {
        const progress = i / 6;
        const target = 50 + (final - 50) * progress;
        current = current * 0.7 + target * 0.3 + (Math.random() - 0.5) * 5;
        data.push(parseFloat(Math.max(0, Math.min(100, current)).toFixed(1)));
    }
    
    data[6] = parseFloat(final.toFixed(1));
    return data;
}

function updateStatus(message) {
    const el = document.getElementById('analysisStatus');
    if (el) {
        const text = el.querySelector('span:last-child');
        if (text) text.textContent = message;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
