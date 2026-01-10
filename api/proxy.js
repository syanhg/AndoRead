export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const path = req.url.replace('/api/', '');
        const url = `https://gamma-api.polymarket.com/${path}`;
        
        console.log('Proxying to:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Polymarket API returned ${response.status}`);
        }
        
        const data = await response.json();
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch data',
            message: error.message 
        });
    }
}
