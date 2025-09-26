const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Simple database
let proxyStorage = {};

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: '🔥 Fenix Proxy Server Running', 
        users: Object.keys(proxyStorage).length,
        timestamp: new Date().toISOString()
    });
});

// Generate unique user ID
app.post('/api/user/register', (req, res) => {
    const userId = 'fenix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    proxyStorage[userId] = { 
        proxies: [], 
        currentProxyIndex: -1,
        createdAt: new Date().toISOString()
    };
    res.json({ success: true, userId });
});

// Save proxies
app.post('/api/proxies/save', (req, res) => {
    const { userId, proxies, currentProxyIndex = -1 } = req.body;
    
    if (!userId) {
        return res.json({ success: false, error: 'User ID required' });
    }
    
    if (!proxyStorage[userId]) {
        proxyStorage[userId] = { proxies: [], currentProxyIndex: -1 };
    }
    
    proxyStorage[userId] = { 
        proxies: proxies || [], 
        currentProxyIndex
    };
    
    res.json({ success: true, count: proxies?.length || 0 });
});

// Load proxies
app.get('/api/proxies/load', (req, res) => {
    const { userId } = req.query;
    
    if (!userId || !proxyStorage[userId]) {
        return res.json({ success: true, proxies: [], currentProxyIndex: -1 });
    }
    
    res.json({ success: true, ...proxyStorage[userId] });
});

// Delete proxies
app.delete('/api/proxies/delete', (req, res) => {
    const { userId } = req.body;
    
    if (userId && proxyStorage[userId]) {
        proxyStorage[userId] = { proxies: [], currentProxyIndex: -1 };
    }
    
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Fenix Proxy Server running on port ${PORT}`);
});
