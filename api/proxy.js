module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Extract the path after /api/
        const apiPath = req.url.replace('/api/', '');
        const url = `https://gamma-api.polymarket.com/${apiPath}`;
        
        console.log('Proxying request to:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
};
