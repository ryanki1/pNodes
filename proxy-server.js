// Simple Express proxy server for pRPC API
const express = require('express');
const cors = require('cors');
const { PrpcClient } = require('xandeum-prpc');

const app = express();
const PORT = 3001;

// Enable CORS for Angular app
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

// Initialize pRPC client
const client = new PrpcClient('173.212.220.65', { timeout: 5000 });

// GET /api/pods - Get all pods
app.get('/api/pods', async (req, res, next) => {
  try {
    console.log('📡 Fetching pods...');
    const response = await client.getPods();
    console.log(`✅ Got ${response.pods.length} pods`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching pods:', error.message);
    const err = new Error('Failed to fetch pods');
    next(err);
  }
});

// GET /api/stats - Get node stats
app.get('/api/stats', async (req, res, next) => {
  try {
    console.log('📡 Fetching stats...');
    const response = await client.getStats();
    console.log('✅ Got stats');
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching stats:', error.message);
    const err = new Error('Failed to fetch stats');
    next(err);
  }
});

// GET /api/pods-with-stats - Get pods with stats
app.get('/api/pods-with-stats', async (req, res, next) => {
  try {
    console.log('📡 Fetching pods with stats...');
    const response = await client.getPodsWithStats();
    console.log(`✅ Got ${response.pods.length} pods with stats`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching pods with stats:', error.message);
    const err = new Error('Failed to fetch pods with stats');
    next(err);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'pRPC Proxy Server is running' });
});

app.use((err, req, res, next) => {
  // central error handling
  const status = err.status || 500;
  res.status(status).json({
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 pRPC Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to pNode: 173.212.220.65:8000`);
  console.log(`🌐 CORS enabled for: http://localhost:4200\n`);
});
