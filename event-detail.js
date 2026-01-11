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
        hideAnalysisStatus();
        return;
    }
    
    // Display basic info
    document.getElementById('eventTitle').textContent = eventData.title;
    document.getElementById('closeDate').textContent = `Closes: ${eventData.closeDate}`;
    document.getElementById('volumeStat').textContent = eventData.volume || '$0';
    document.getElementById('volume24hStat').textContent = eventData.volume24h || '$0';
    document.getElementById('liquidityStat').textContent = eventData.liquidity || '$0';
    
    // Start comprehensive analysis with minimum 10 sources requirement
    await performAdvancedAnalysis(eventData);
}

async function performAdvancedAnalysis(event) {
    try {
        // Step 1: Comprehensive web research using Tavily (MINIMUM 10 sources required)
        updateStatus('Conducting comprehensive research with Tavily AI Search...');
        const tavilyResults = await searchWithTavily(event.title, 15);
        
        console.log(`Found ${tavilyResults.length} sources for analysis`);
        
        // CRITICAL: Must have at least 10 sources to proceed
        if (tavilyResults.length < 10) {
            const errorMsg = `INSUFFICIENT SOURCES: Found only ${tavilyResults.length} sources. Minimum 10 credible sources required for statistical analysis.`;
            updateStatus(errorMsg);
            document.getElementById('analysisContent').innerHTML = `
                <div style="padding: 20px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px;">
                    <p style="color: #991b1b; font-weight: 600; margin-bottom: 8px;">Analysis Cannot Proceed</p>
                    <p style="color: #7f1d1d; font-size: 13px;">${errorMsg}</p>
                    <p style="color: #7f1d1d; font-size: 13px; margin-top: 12px;">
                        The event "${event.title}" may be too niche or too recent. Please try a different event with more available information.
                    </p>
                </div>
            `;
            hideAnalysisStatus();
            return;
        }
        
        // Display sources immediately
        displaySources(tavilyResults);
        
        // Step 2: Advanced multi-stage analysis with research paper methodology
        updateStatus('Performing advanced statistical analysis with AI using Bayesian inference...');
        await streamAdvancedAnalysis(event, tavilyResults);
        
    } catch (error) {
        console.error('Analysis error:', error);
        document.getElementById('analysisContent').innerHTML = `
            <p style="color: #991b1b;">Analysis encountered an error: ${error.message}</p>
        `;
        hideAnalysisStatus();
    }
}

async function searchWithTavily(query, numResults = 15) {
    try {
        // Tavily API optimized for AI agents and RAG
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: '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',
                query: query,
                search_depth: 'advanced',
                max_results: numResults,
                include_answer: false,
                include_raw_content: true,
                include_domains: [],
                exclude_domains: []
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Tavily API error: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform Tavily response to our expected format
        if (data.results && Array.isArray(data.results)) {
            return data.results.map(result => ({
                title: result.title || 'Untitled',
                url: result.url || '',
                text: result.content || result.raw_content || '',
                publishedDate: result.published_date || new Date().toISOString().split('T')[0],
                score: result.score || 0
            }));
        }
        
        return [];
        
    } catch (error) {
        console.error('Tavily search error:', error);
        throw error;
    }
}

async function streamAdvancedAnalysis(event, tavilyResults) {
    const prompt = buildAdvancedAnalysisPrompt(event, tavilyResults);
    
    try {
        const analysisEl = document.getElementById('analysisContent');
        analysisEl.innerHTML = '<p style="color: #6b7280;">Streaming AI analysis...</p>';
        
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 4000,
                messages: [
                    { role: "user", content: prompt }
                ],
            })
        });

        const data = await response.json();
        let fullText = '';
        
        if (data.content && data.content.length > 0) {
            fullText = data.content.map(item => item.text || '').join('\n');
            analysisEl.innerHTML = formatAnalysisText(fullText);
            
            // Parse predictions and metrics
            const analysis = parseStreamedResponse(fullText);
            displayPredictions(analysis.predictions);
            displayModelInsight(analysis.insight);
            displayAnalysisMetrics(analysis);
            
            updateStatus(`Analysis complete - ${analysis.sources_cited} sources analyzed`);
            setTimeout(hideAnalysisStatus, 2000);
        }
        
    } catch (error) {
        console.error('Claude error:', error);
        throw error;
    }
}

function buildAdvancedAnalysisPrompt(event, tavilyResults) {
    // Build comprehensive source context (minimum 10 sources)
    const topSources = tavilyResults.slice(0, Math.max(10, tavilyResults.length));
    const sources = topSources.map((result, i) => 
        `[SOURCE ${i + 1}] ${result.title}
URL: ${result.url}
Published: ${result.publishedDate}
Relevance Score: ${(result.score * 100).toFixed(1)}%
Content: ${(result.text || '').substring(0, 1500)}
---`
    ).join('\n\n');
    
    // Advanced prompt based on MIRAI research paper methodology
    return `You are a professional forecasting analyst using rigorous statistical methods and multi-source evidence synthesis following the MIRAI research paper methodology.

CRITICAL REQUIREMENTS:
- You MUST cite at least 10 different sources in your analysis
- Every major claim must reference specific sources by exact title
- Provide quantitative reasoning with statistical foundations
- Use Bayesian updating when incorporating new evidence
- Consider base rates, historical precedents, and trend analysis
- Show your probability calculations step-by-step

EVENT DETAILS:
Title: ${event.title}
Market Data: Volume ${event.volume}, 24h Vol ${event.volume24h}, Liquidity ${event.liquidity}
Closes: ${event.closeDate}
Current Status: ${event.active ? 'Active' : 'Closed'}

AVAILABLE SOURCES (${topSources.length} high-quality sources from Tavily AI Search):
${sources}

ANALYSIS FRAMEWORK (following MIRAI research methodology):

**Base Rate Analysis**
Start with the prior probability based on:
- Historical frequency of similar events (cite specific data from sources)
- Domain-specific base rates (reference industry statistics)
- Reference class forecasting (compare to similar past events)
Example: "Based on [SOURCE 1], similar events occur with X% frequency..."

**Multi-Source Evidence Synthesis**
Systematically evaluate each source with Bayesian updating:
- Source 1 (cite exact title): Key finding and reliability assessment
  Prior: X% → Updated to Y% because [specific evidence]
- Source 2 (cite exact title): How this updates our belief
  Prior: Y% → Updated to Z% because [specific evidence]
- Continue through at least 10 sources
- Weight sources by: credibility (use relevance scores), recency, sample size
- Identify consensus views vs. outlier predictions

**Quantitative Probability Assessment**
Show explicit Bayesian updating:
- Starting probability (base rate): X%
- After source 1: X% × [likelihood ratio] = Y%
- After source 2: Y% × [likelihood ratio] = Z%
- Continue through all major sources
- Final probability with 95% confidence interval: [A%, B%]

**Statistical Indicators**
- Trend direction and momentum (cite data)
- Volatility measures (use market data: ${event.volume24h})
- Correlation with related events/markets
- Key leading indicators from sources

**Risk Factors and Scenarios**
Bull case (probability: X%): [specific scenario with evidence]
Base case (probability: Y%): [most likely outcome with evidence]
Bear case (probability: Z%): [downside scenario with evidence]
Note: Probabilities must sum to 100%

**Temporal Considerations**
- Days until event closes
- How probability may shift as event approaches
- Key catalysts or news to watch (cite sources)

**Confidence Assessment**
- Data quality: High/Medium/Low (based on source scores)
- Source agreement: Strong/Moderate/Weak (quantify % agreement)
- Overall confidence: High/Medium/Low
- Key uncertainties remaining (be specific)

\`\`\`json
{
  "predictions": [
    {"outcome": "Yes", "probability": 0.XX, "confidence": "High/Medium/Low"},
    {"outcome": "No", "probability": 0.XX, "confidence": "High/Medium/Low"}
  ],
  "insight": "Single most important factor affecting outcome based on source consensus",
  "confidence": "High|Medium|Low",
  "sources_cited": 10,
  "base_rate": 0.XX,
  "key_uncertainty": "Primary risk factor that could change prediction"
}
\`\`\`

MANDATORY REQUIREMENTS:
✓ Cite at least 10 different sources by exact title throughout analysis
✓ Show Bayesian updating calculations explicitly (prior → posterior)
✓ Provide specific probabilities with statistical reasoning
✓ Quantify uncertainty with confidence intervals
✓ Use domain-specific metrics and indicators
✓ Probabilities must sum to 1.0
✓ No hedging - provide definitive statistical analysis

Remember: You have ${topSources.length} high-quality sources. Use them all strategically.`;
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
                key_uncertainty: parsed.key_uncertainty || 'Multiple factors',
                sources_cited: parsed.sources_cited || 0
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
        confidence: 'Medium',
        sources_cited: 0
    };
}

function formatAnalysisText(text) {
    let displayText = text.replace(/```json[\s\S]*?```/g, '').trim();
    displayText = displayText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const paragraphs = displayText.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map(p => {
        if (p.includes('<strong>')) {
            return p;
        }
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
}

function displayPredictions(predictions) {
    const container = document.getElementById('predictionRows');
    container.innerHTML = predictions.map(pred => `
        <div class="table-row">
            <span class="row-label">${escapeHtml(pred.outcome)}</span>
            <span class="row-value">
                ${(pred.probability * 100).toFixed(0)}%
                <span class="confidence-badge">(${pred.confidence})</span>
            </span>
        </div>
    `).join('');
}

function displayModelInsight(insight) {
    document.getElementById('modelInsightText').textContent = insight;
}

function displayAnalysisMetrics(analysis) {
    if (analysis.sources_cited >= 10) {
        const verifiedEl = document.getElementById('sourcesVerified');
        verifiedEl.style.display = 'flex';
        document.getElementById('sourcesCount').textContent = 
            `${analysis.sources_cited} sources analyzed`;
    }
    
    const metricsEl = document.getElementById('analysisMetrics');
    metricsEl.style.display = 'block';
    
    document.getElementById('baseRate').textContent = 
        analysis.base_rate ? `${(analysis.base_rate * 100).toFixed(0)}%` : '--';
    document.getElementById('confidenceLevel').textContent = 
        analysis.confidence || '--';
    document.getElementById('keyUncertainty').textContent = 
        analysis.key_uncertainty ? analysis.key_uncertainty.substring(0, 30) + '...' : '--';
}

function displaySources(tavilyResults) {
    const container = document.getElementById('sourcesList');
    const sources = tavilyResults.slice(0, 15);
    
    document.getElementById('totalSources').textContent = sources.length;
    
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
                [${i + 1}] ${new URL(source.url).hostname} • ${source.publishedDate} • Score: ${(source.score * 100).toFixed(0)}%
            </div>
        </div>
    `).join('');
}

function updateStatus(message) {
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

function hideAnalysisStatus() {
    const statusEl = document.getElementById('analysisStatus');
    if (statusEl) {
        statusEl.style.display = 'none';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
