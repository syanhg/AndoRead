const urlParams = new URLSearchParams(window.location.search);
const eventSlug = urlParams.get('event');

document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
    // Wait for Puter to load
    if (typeof puter === 'undefined') {
        console.error('Puter not loaded, retrying...');
        setTimeout(loadEventData, 500);
    } else {
        loadEventData();
    }
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
    document.getElementById('volumeStat').textContent = eventData.volume || '$0';
    document.getElementById('volume24hStat').textContent = eventData.volume24h || '$0';
    document.getElementById('liquidityStat').textContent = eventData.liquidity || '$0';
    
    // Show loading predictions
    displayLoadingPredictions();
    
    // Start analysis
    await performAIAnalysis(eventData);
}

function displayLoadingPredictions() {
    const container = document.getElementById('predictionRows');
    container.innerHTML = `
        <div class="table-row">
            <span class="row-label">Analyzing...</span>
            <span class="row-value">--</span>
        </div>
    `;
}

async function performAIAnalysis(event) {
    try {
        console.log('Starting analysis for:', event.title);
        
        // Step 1: Show thinking
        showThinkingPhase(event);
        
        // Step 2: Show searching
        showSearchingPhase(event);
        
        // Step 3: Get sources (fast - only 6 sources)
        console.log('Fetching sources...');
        const exaResults = await searchWithExa(event.title, 6);
        console.log(`Got ${exaResults.length} sources`);
        
        // Step 4: Show reviewing
        showReviewingPhase(exaResults);
        
        // Step 5: Display sources
        displaySources(exaResults);
        
        // Step 6: AI Analysis with timeout
        console.log('Starting AI analysis...');
        const analysisPromise = runAIAnalysis(event, exaResults);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI analysis timeout')), 30000)
        );
        
        await Promise.race([analysisPromise, timeoutPromise]);
        
        // Hide status
        setTimeout(() => {
            const statusEl = document.getElementById('analysisStatus');
            if (statusEl) statusEl.style.display = 'none';
        }, 2000);
        
    } catch (error) {
        console.error('Analysis error:', error);
        document.getElementById('analysisContent').innerHTML = `
            <p style="color: #ef4444;"><strong>Error:</strong> ${error.message}</p>
            <p style="color: #6b7280;">Showing basic analysis instead.</p>
        `;
        
        // Fallback to simple predictions
        displayPredictions([
            { outcome: 'Yes', probability: 0.5, confidence: 'Low' },
            { outcome: 'No', probability: 0.5, confidence: 'Low' }
        ]);
    }
}

function showThinkingPhase(event) {
    document.getElementById('thinkingContent').textContent = 
        `Analyzing "${event.title}" with AI...`;
}

function showSearchingPhase(event) {
    const searchingSection = document.getElementById('searchingSection');
    searchingSection.style.display = 'block';
    
    const queries = [
        `${event.title.substring(0, 45)} predictions 2026`,
        `${event.title.substring(0, 45)} analysis forecast`,
        `${event.title.substring(0, 45)} expert opinion`
    ];
    
    const searchQueries = document.getElementById('searchQueries');
    queries.forEach((query, i) => {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'search-query shimmer-active';
            el.innerHTML = `
                <svg class="search-icon-small" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <span>${escapeHtml(query)}</span>
            `;
            searchQueries.appendChild(el);
            setTimeout(() => el.classList.remove('shimmer-active'), 1200);
        }, i * 80);
    });
}

function showReviewingPhase(exaResults) {
    const reviewingSection = document.getElementById('reviewingSection');
    reviewingSection.style.display = 'block';
    
    const reviewingSources = document.getElementById('reviewingSources');
    const topSources = exaResults.slice(0, 5);
    
    topSources.forEach((source, i) => {
        setTimeout(() => {
            const domain = new URL(source.url).hostname.replace('www.', '');
            const domainName = domain.split('.')[0];
            
            const el = document.createElement('div');
            el.className = 'source-item shimmer-active';
            
            let faviconClass = 'default';
            let faviconText = domainName.charAt(0).toUpperCase();
            
            if (domain.includes('youtube')) {
                faviconClass = 'youtube';
                faviconText = '▶';
            }
            
            el.innerHTML = `
                <div class="source-favicon ${faviconClass}">${faviconText}</div>
                <div class="source-info">
                    <span class="source-title">${escapeHtml(source.title.substring(0, 55))}...</span>
                    <div class="source-domain">${escapeHtml(domainName)}</div>
                </div>
            `;
            
            reviewingSources.appendChild(el);
            setTimeout(() => el.classList.remove('shimmer-active'), 1500);
        }, i * 100);
    });
}

async function searchWithExa(query, numResults = 6) {
    try {
        const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'ab80b7d9-b049-4cb8-94af-02cb6fa0b4d2'
            },
            body: JSON.stringify({
                query: query,
                numResults: numResults,
                useAutoprompt: true,
                type: 'neural',
                contents: {
                    text: { maxCharacters: 800 }
                }
            })
        });
        
        if (!response.ok) throw new Error('Search API failed');
        const data = await response.json();
        return data.results || [];
        
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

async function runAIAnalysis(event, exaResults) {
    const prompt = buildPrompt(event, exaResults);
    
    try {
        // Check if puter is available
        if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat) {
            throw new Error('Puter AI not available');
        }
        
        console.log('Calling puter.ai.chat...');
        const analysisEl = document.getElementById('analysisContent');
        analysisEl.innerHTML = '<p style="color: #6b7280;">AI is analyzing sources...</p>';
        
        let fullText = '';
        let hasStarted = false;
        
        // Call AI with streaming
        const stream = await puter.ai.chat(prompt);
        
        // Handle streaming response
        if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
            for await (const chunk of stream) {
                if (chunk && chunk.text) {
                    hasStarted = true;
                    fullText += chunk.text;
                    analysisEl.innerHTML = formatAnalysisText(fullText);
                }
            }
        } else if (stream && stream.text) {
            // Non-streaming response
            fullText = stream.text;
            analysisEl.innerHTML = formatAnalysisText(fullText);
        }
        
        if (!hasStarted) {
            throw new Error('No response from AI');
        }
        
        console.log('AI analysis complete, parsing...');
        
        // Parse and display
        const analysis = parseResponse(fullText);
        displayPredictions(analysis.predictions);
        displayModelInsight(analysis.insight);
        
    } catch (error) {
        console.error('AI Error:', error);
        throw error;
    }
}

function buildPrompt(event, exaResults) {
    const sources = exaResults.slice(0, 6).map((r, i) => {
        const text = (r.text || '').replace(/\n+/g, ' ').trim();
        return `SOURCE ${i+1}: "${r.title}"
From: ${new URL(r.url).hostname}
Summary: ${text.substring(0, 600)}
---`;
    }).join('\n\n');
    
    return `Analyze this prediction market event and provide probabilities.

EVENT: "${event.title}"
Market Volume: ${event.volume}
Closes: ${event.closeDate}

SOURCES:
${sources}

Analyze the sources and provide predictions in this exact JSON format:

\`\`\`json
{
  "predictions": [
    {"outcome": "Yes", "probability": 0.XX, "confidence": "High|Medium|Low"},
    {"outcome": "No", "probability": 0.XX, "confidence": "High|Medium|Low"}
  ],
  "insight": "Brief key insight (one sentence)",
  "confidence": "High|Medium|Low"
}
\`\`\`

Provide a brief 2-3 paragraph analysis citing sources, then the JSON.`;
}

function parseResponse(text) {
    try {
        const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            return {
                predictions: parsed.predictions || [],
                insight: parsed.insight || 'Analysis complete',
                confidence: parsed.confidence || 'Medium'
            };
        }
    } catch (e) {
        console.error('Parse error:', e);
    }
    
    // Fallback
    return {
        predictions: [
            { outcome: 'Yes', probability: 0.5, confidence: 'Medium' },
            { outcome: 'No', probability: 0.5, confidence: 'Medium' }
        ],
        insight: 'See analysis above',
        confidence: 'Medium'
    };
}

function formatAnalysisText(text) {
    let display = text.replace(/```json[\s\S]*?```/g, '').trim();
    display = display.replace(/\*\*(.*?)\*\*/g, '<h4>$1</h4>');
    
    const paragraphs = display.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => {
        if (p.includes('<h4>')) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
}

function displayPredictions(predictions) {
    const container = document.getElementById('predictionRows');
    container.innerHTML = predictions.map(pred => `
        <div class="table-row">
            <span class="row-label">${escapeHtml(pred.outcome)}</span>
            <span class="row-value">${(pred.probability * 100).toFixed(0)}%</span>
        </div>
    `).join('');
}

function displayModelInsight(insight) {
    document.getElementById('modelInsightText').textContent = insight;
}

function displaySources(exaResults) {
    const container = document.getElementById('sourcesList');
    const sources = exaResults.slice(0, 6);
    
    document.getElementById('totalSources').textContent = sources.length;
    
    container.innerHTML = sources.map((source, i) => `
        <div class="source-card">
            <div class="source-header">
                <div class="source-title">${escapeHtml(source.title)}</div>
                <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener" class="source-link">View</a>
            </div>
            <div class="source-description">
                ${escapeHtml((source.text || '').substring(0, 150))}...
            </div>
            <div class="source-citation">
                [${i + 1}] ${new URL(source.url).hostname}
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
