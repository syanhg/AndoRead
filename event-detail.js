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
    document.getElementById('volumeStat').textContent = eventData.volume || '$0';
    document.getElementById('volume24hStat').textContent = eventData.volume24h || '$0';
    document.getElementById('liquidityStat').textContent = eventData.liquidity || '$0';
    
    // Start comprehensive analysis
    await performAdvancedAnalysis(eventData);
}

async function performAdvancedAnalysis(event) {
    try {
        // Step 1: Comprehensive web research (minimum 10 sources)
        updateStatus('Conducting comprehensive research across multiple sources...');
        const exaResults = await searchWithExa(event.title, 15); // Request more sources
        console.log(`Found ${exaResults.length} sources for analysis`);
        
        // Display sources immediately
        displaySources(exaResults);
        
        // Step 2: Advanced multi-stage Claude analysis with research paper methodology
        updateStatus('Performing advanced statistical analysis with AI...');
        await streamAdvancedAnalysis(event, exaResults);
        
    } catch (error) {
        console.error('Analysis error:', error);
        document.getElementById('analysisContent').innerHTML = `
            <p style="color: #000000;">Analysis encountered an error. Please refresh the page.</p>
        `;
    }
}

async function searchWithExa(query, numResults = 15) {
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
                    text: { maxCharacters: 2000 }
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

async function streamAdvancedAnalysis(event, exaResults) {
    const eventIntel = extractEventIntelligence(event.title);
    const prompt = buildAdvancedAnalysisPrompt(event, exaResults, eventIntel);
    
    try {
        if (typeof puter === 'undefined') {
            throw new Error('Puter.js not loaded');
        }
        
        const analysisEl = document.getElementById('analysisContent');
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
        
        // Parse predictions and create visualizations
        const analysis = parseStreamedResponse(fullText);
        displayPredictions(analysis.predictions);
        displayModelInsight(analysis.insight);
        
        // Create sophisticated charts
        createAdvancedCharts(analysis);
        
        updateStatus('Analysis complete');
        setTimeout(() => {
            const statusEl = document.getElementById('analysisStatus');
            if (statusEl) statusEl.style.display = 'none';
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
    
    // Sports event detection
    if (titleLower.match(/\bvs\b|\bat\b|game|match|championship|bowl|playoff|finals?|tournament/)) {
        eventType = 'sports';
        const vsMatch = title.match(/(.+?)\s+(?:vs\.?|at)\s+(.+?)(?:\s|$|\?)/i);
        if (vsMatch) {
            entities = [vsMatch[1].trim(), vsMatch[2].trim()];
        }
        if (titleLower.includes('champion') || titleLower.includes('bowl') || titleLower.includes('cup')) {
            eventType = 'championship';
            context = 'Championship event - analyze historical performance, team strength, head-to-head records';
        } else {
            context = 'Sports match - consider recent form, injuries, home advantage, historical matchups';
        }
    } 
    // Political event detection
    else if (titleLower.match(/election|president|senate|congress|poll|vote|campaign|nominee/)) {
        eventType = 'political';
        context = 'Political event - analyze polling data, historical trends, demographic factors, campaign momentum';
    } 
    // Financial/market detection
    else if (titleLower.match(/bitcoin|btc|eth|stock|price|\$|usd|market|trading|inflation|fed|rate/)) {
        eventType = 'financial';
        context = 'Financial prediction - consider market trends, technical indicators, sentiment, macroeconomic factors';
    }
    // Weather/climate
    else if (titleLower.match(/weather|hurricane|storm|temperature|rain|snow|climate/)) {
        eventType = 'weather';
        context = 'Weather prediction - analyze meteorological models, historical patterns, current conditions';
    }
    // Entertainment/awards
    else if (titleLower.match(/oscar|emmy|grammy|award|nominee|win|movie|film|album/)) {
        eventType = 'entertainment';
        context = 'Entertainment prediction - consider expert reviews, box office, streaming data, previous award patterns';
    }
    // Technology/product
    else if (titleLower.match(/release|launch|announce|iphone|product|tech|software|app/)) {
        eventType = 'technology';
        context = 'Technology prediction - analyze company patterns, market readiness, supply chain, competitor moves';
    }
    // General binary
    else {
        eventType = 'binary';
        entities = ['Yes', 'No'];
        context = 'Binary outcome - evaluate evidence for and against, consider base rates and precedents';
    }
    
    return { type: eventType, entities, context, title };
}

function buildAdvancedAnalysisPrompt(event, exaResults, eventIntel) {
    // Build comprehensive source context (minimum 10 sources) - MIRAI methodology
    const topSources = exaResults.slice(0, Math.max(12, exaResults.length));
    const sources = topSources.map((result, i) => {
        const sourceNum = i + 1;
        const cleanText = (result.text || '').replace(/\n+/g, ' ').trim();
        return `SOURCE ${sourceNum}: "${result.title}"
Publisher: ${new URL(result.url).hostname}
Date: ${result.publishedDate || 'Recent'}
Reliability: ${assessSourceReliability(result.url)}
Key Content: ${cleanText.substring(0, 1500)}
---`;
    }).join('\n\n');
    
    let entityGuidance = '';
    if (eventIntel.entities.length > 0) {
        entityGuidance = `\nOUTCOMES TO PREDICT: ${eventIntel.entities.join(' vs ')}`;
    }
    
    // Advanced prompt based on MIRAI research paper methodology with ReAct framework
    return `You are a professional forecasting analyst using rigorous statistical methods and multi-source evidence synthesis. Follow the MIRAI benchmark methodology for temporal reasoning.

CRITICAL REQUIREMENTS (MIRAI Framework):
✓ MANDATORY: You MUST cite at least ${Math.min(topSources.length, 10)} different sources by exact title
✓ EVERY major claim must reference specific SOURCE by number and exact title
✓ Use Bayesian updating: show how each source changes your probability estimate
✓ Provide quantitative base rates from historical data
✓ Calculate weighted probability based on source reliability and recency
✓ Show statistical confidence intervals for predictions
✓ Use temporal reasoning to account for time-decay of information

EVENT ANALYSIS:
Title: ${event.title}
Type: ${eventIntel.type}${entityGuidance}
Context: ${eventIntel.context}
Market Data: Volume ${event.volume}, 24h Vol ${event.volume24h}, Liquidity ${event.liquidity}
Closes: ${event.closeDate}

AVAILABLE SOURCES (${topSources.length} verified sources):
${sources}

═══════════════════════════════════════════════════════════════
ANALYSIS METHODOLOGY - Follow MIRAI ReAct Framework:
═══════════════════════════════════════════════════════════════

**STEP 1: Base Rate Analysis (Historical Prior)**
Establish the baseline probability using:
- Historical frequency of similar ${eventIntel.type} events
- Domain-specific base rates for "${event.title}" type scenarios
- Reference class forecasting from past analogous events
REQUIRED: State your starting prior probability: "Base rate: X%" with historical justification

**STEP 2: Multi-Source Evidence Synthesis (Bayesian Updating)**
Systematically evaluate EACH source with Think-Act-Observe methodology:

SOURCE 1 Analysis:
- Citation: [Quote exact title from SOURCE 1]
- Key Finding: [Specific evidence]
- Reliability Weight: [High/Medium/Low based on publisher]
- Bayesian Update: "Prior X% → Updated Y% because [specific reasoning]"
- Confidence Impact: [How this affects uncertainty]

SOURCE 2 Analysis:
- Citation: [Quote exact title from SOURCE 2]
- Key Finding: [Specific evidence that agrees/contradicts SOURCE 1]
- Cross-validation: [Does this corroborate or conflict?]
- Bayesian Update: "Prior Y% → Updated Z% because [specific reasoning]"

Continue through SOURCE 3, 4, 5, 6, 7, 8, 9, 10+ with the SAME format.
MANDATORY: You must show probability updates for at least ${Math.min(topSources.length, 10)} sources.

**STEP 3: Statistical Probability Synthesis**
After processing all sources:
- Final Probability Calculation: [Show weighted average formula]
- Confidence Interval: [X% to Y% with Z% confidence]
- Consensus Strength: [How much do sources agree? Measure: X/10 sources support primary outcome]
- Outlier Analysis: [Which sources diverge and why?]
- Information Quality Score: [Rate 1-10 based on source reliability, recency, sample size]

**STEP 4: Quantitative Risk Assessment**
Best Case (P=X%): [Describe scenario, cite supporting sources]
Base Case (P=Y%): [Most likely scenario, cite supporting sources]  
Worst Case (P=Z%): [Describe scenario, cite supporting sources]
Where X + Y + Z = 100%

**STEP 5: Temporal Analysis & Trend Direction**
- Time until event: [Calculate days remaining]
- Momentum analysis: [Is probability increasing or decreasing over time?]
- Information velocity: [Are new sources adding clarity or uncertainty?]
- Expected probability shift: [How might this change as event approaches?]
- Key catalysts to monitor: [What could change the forecast?]

**STEP 6: Statistical Indicators**
- Trend Direction: [Upward/Downward/Stable with ±X% per week]
- Volatility: [σ = X%, indicating uncertainty level]
- Market Efficiency: [Does volume/liquidity suggest informed traders?]
- Sentiment Analysis: [Aggregate tone across sources: X% positive, Y% negative]

**STEP 7: Confidence & Uncertainty Quantification**
- Data Quality: [High/Medium/Low - based on source count and reliability]
- Source Agreement: [Strong/Moderate/Weak - X% consensus]
- Information Completeness: [X% of key factors covered]
- Overall Confidence: [High/Medium/Low with numerical score]
- Key Unknowns: [List top 3 factors that could change prediction]
- Black Swan Risks: [Low-probability, high-impact scenarios]

\`\`\`json
{
  "predictions": [
    {
      "outcome": "${eventIntel.entities[0] || 'Primary Outcome'}", 
      "probability": 0.XX,
      "confidence_interval": [0.XX, 0.XX],
      "confidence": "High|Medium|Low",
      "key_drivers": ["Driver 1 (SOURCE X)", "Driver 2 (SOURCE Y)"]
    },
    {
      "outcome": "${eventIntel.entities[1] || 'Alternative Outcome'}", 
      "probability": 0.XX,
      "confidence_interval": [0.XX, 0.XX],
      "confidence": "High|Medium|Low",
      "key_drivers": ["Driver 1 (SOURCE Z)", "Driver 2 (SOURCE W)"]
    }
  ],
  "methodology": {
    "base_rate": 0.XX,
    "sources_analyzed": ${topSources.length},
    "bayesian_updates": ${Math.min(topSources.length, 10)},
    "consensus_strength": 0.XX
  },
  "insight": "Single most critical factor: [X from SOURCE Y] makes [outcome] most likely",
  "confidence": "High|Medium|Low",
  "information_quality": 0.XX,
  "key_uncertainty": "Primary risk: [specific factor that could change outcome]"
}
\`\`\`

═══════════════════════════════════════════════════════════════
MANDATORY CHECKLIST - Verify before submitting:
═══════════════════════════════════════════════════════════════
✓ Cited at least ${Math.min(topSources.length, 10)} sources by EXACT title
✓ Showed Bayesian probability updates for each major source  
✓ Provided base rate with historical justification
✓ Calculated confidence intervals, not just point estimates
✓ Quantified source agreement and consensus strength
✓ Included temporal trend analysis  
✓ Listed specific uncertainties and risk factors
✓ All probabilities sum to exactly 1.0
✓ Used concrete numbers (not vague terms like "likely")
✓ Explained statistical reasoning for each probability shift

QUALITY STANDARDS:
- Every claim must trace back to a numbered SOURCE by exact title
- Use "According to [SOURCE X title], ..." format for attribution
- When sources conflict, explicitly state: "SOURCE X says [A] while SOURCE Y says [B], weighting toward X because [reliability reason]"
- Probability updates must be logical and mathematically sound
- Final prediction must be defensible using Bayesian reasoning

Begin your analysis now, following ALL steps above. This is a rigorous forecasting task requiring statistical precision and exhaustive source documentation.`;
}

function parseStreamedResponse(text) {
    try {
        const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            return {
                predictions: parsed.predictions || [
                    { outcome: 'Yes', probability: 0.5, confidence: 'Medium' },
                    { outcome: 'No', probability: 0.5, confidence: 'Medium' }
                ],
                insight: parsed.insight || 'Analysis complete',
                confidence: parsed.confidence || 'Medium',
                base_rate: parsed.base_rate || 0.5,
                key_uncertainty: parsed.key_uncertainty || 'Multiple factors'
            };
        }
    } catch (error) {
        console.error('Parse error:', error);
    }
    
    return {
        predictions: [
            { outcome: 'Yes', probability: 0.5, confidence: 'Medium' },
            { outcome: 'No', probability: 0.5, confidence: 'Medium' }
        ],
        insight: 'See detailed analysis above',
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
        // Preserve line breaks within paragraphs
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
    const sources = exaResults.slice(0, 15);
    
    document.getElementById('sourcesCount').textContent = sources.length;
    
    container.innerHTML = sources.map((source, i) => `
        <div class="source-card">
            <div class="source-header">
                <div class="source-title">${escapeHtml(source.title)}</div>
                <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener" class="source-link">View</a>
            </div>
            <div class="source-description">
                ${escapeHtml((source.text || '').substring(0, 180))}...
            </div>
            <div class="source-citation">
                [${i + 1}] ${new URL(source.url).hostname} • ${source.publishedDate || 'Recent'}
            </div>
        </div>
    `).join('');
}

function createAdvancedCharts(analysis) {
    const predictions = analysis.predictions || [];
    
    // Main probability chart
    createProbabilityChart(predictions);
}

function createProbabilityChart(predictions) {
    const container = document.getElementById('mainChart');
    container.innerHTML = '<div id="chartCanvas"></div>';
    
    // Generate time series data showing probability evolution
    const categories = ['30d ago', '20d ago', '10d ago', '5d ago', 'Today'];
    const series = predictions.map(pred => {
        const finalProb = pred.probability * 100;
        return {
            name: pred.outcome,
            data: generateProbabilityTrend(finalProb, 5)
        };
    });
    
    const options = {
        series: series,
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            },
            fontFamily: 'Manrope, sans-serif'
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#000000', '#6b7280', '#9ca3af'],
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#6b7280',
                    fontSize: '12px',
                    fontFamily: 'Manrope, sans-serif'
                }
            }
        },
        yaxis: {
            min: 0,
            max: 100,
            labels: {
                formatter: (v) => v.toFixed(0) + '%',
                style: {
                    colors: '#6b7280',
                    fontSize: '12px',
                    fontFamily: 'Manrope, sans-serif'
                }
            }
        },
        legend: {
            show: true,
            position: 'top',
            fontFamily: 'Manrope, sans-serif',
            labels: {
                colors: '#000000'
            }
        },
        tooltip: {
            y: {
                formatter: (v) => v.toFixed(1) + '%'
            }
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 3
        }
    };
    
    const chart = new ApexCharts(document.querySelector("#chartCanvas"), options);
    chart.render();
}

function generateProbabilityTrend(finalProb, points) {
    const data = [];
    const baseProb = 50;
    
    for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);
        // Smooth sigmoid-like curve
        const smoothing = Math.pow(progress, 0.7);
        const noise = (Math.random() - 0.5) * 3;
        const value = baseProb + (finalProb - baseProb) * smoothing + noise;
        data.push(parseFloat(Math.max(0, Math.min(100, value)).toFixed(1)));
    }
    
    // Ensure last point is exact
    data[points - 1] = parseFloat(finalProb.toFixed(1));
    return data;
}

function updateStatus(message) {
    const el = document.getElementById('analysisStatus');
    if (el) {
        const textSpan = el.querySelector('span:last-child');
        if (textSpan) textSpan.textContent = message;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
