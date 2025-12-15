# Xandeum pNode Analytics Dashboard

Real-time monitoring dashboard for the Xandeum pNode network.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v10+)

### Installation & Run

```bash
# Install dependencies
npm install
cd xandeum-pnode-analytics && npm install && cd ..

# Start both servers (proxy + frontend)
npm run dev
```

The dashboard will be available at:
- **Frontend:** http://localhost:4200
- **Proxy API:** http://localhost:3001

## 📋 Available Scripts

### `npm run dev`
Starts both the proxy server and Angular frontend simultaneously.

### `npm run proxy`
Starts only the Express proxy server (port 3001).

### `npm run frontend`
Starts only the Angular development server (port 4200).

## 🏗️ Architecture

```
Browser (localhost:4200)
    ↓ HTTP Request
Express Proxy (localhost:3001)
    ↓ xandeum-prpc (Node.js)
pNode API (173.212.220.65:8000)
```

### Why a Proxy Server?

The `xandeum-prpc` library uses Node.js-specific modules and cannot run directly in the browser. The Express proxy server:
- Runs the pRPC client in Node.js environment
- Handles CORS for browser access
- Forwards API requests to the pNode network

## 🎯 Features

- **Network Overview** - Total pods, online count, total storage
- **Node Statistics** - CPU, RAM, uptime, packet stats
- **Pod List** - Sortable table with all active pods
- **Real-time Data** - Live updates from pNode network
- **Responsive Design** - Mobile-first layout
- **Dark Mode** - Automatic based on system preference

## 🛠️ Tech Stack

- **Frontend:** Angular 20 (Standalone Components)
- **UI Library:** NG-Zorro Ant Design
- **Backend:** Express.js (Proxy Server)
- **API Client:** xandeum-prpc
- **State Management:** Angular Signals
- **Styling:** SCSS + Dark Mode Support

## 📁 Project Structure

```
pNodes/
├── proxy-server.js              # Express proxy for pRPC API
├── test-prpc.js                 # pRPC connection test script
├── package.json                 # Root dependencies
└── xandeum-pnode-analytics/     # Angular application
    ├── src/
    │   ├── app/
    │   │   ├── services/
    │   │   │   └── p-rpc.service.ts    # pRPC API service
    │   │   ├── app.ts                  # Main component
    │   │   ├── app.html                # Dashboard template
    │   │   └── app.scss                # Dashboard styles
    │   └── styles.scss                  # Global styles
    └── package.json
```

## 🔧 Configuration

### Change pNode IP

Edit `proxy-server.js`:
```javascript
const client = new PrpcClient('YOUR_IP_HERE', 5000);
```

### API Endpoints

The proxy server exposes:
- `GET /api/pods` - Get all pods
- `GET /api/stats` - Get node statistics
- `GET /health` - Health check

## 📊 API Data Structure

### Pod Object
```typescript
{
  address: string;              // "173.212.207.32:9001"
  pubkey: string;               // "EcTqXg...bKcL"
  last_seen_timestamp: number;  // Unix timestamp
  version: string;              // "0.7.3"
  is_public: boolean;
  rpc_port: number;
  storage_committed: number;    // bytes
  storage_usage_percent: number;
  storage_used: number;         // bytes
  uptime: number;               // seconds
}
```

### NodeStats Object
```typescript
{
  active_streams: number;
  cpu_percent: number;
  current_index: number;
  file_size: number;
  packets_received: number;
  packets_sent: number;
  ram_total: number;           // bytes
  ram_used: number;            // bytes
  uptime: number;              // seconds
}
```

## 🐛 Troubleshooting

### Ports already in use
```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9  # Proxy
lsof -ti:4200 | xargs kill -9  # Frontend
```

### Connection refused errors
Make sure the proxy server is running before starting the frontend.

### No data loading
Check the proxy server logs for pRPC connection errors.

## 📝 Development Notes

- The proxy server must be running for the frontend to fetch data
- The pRPC library requires Node.js and cannot run in browsers
- CORS is configured for localhost:4200 only

## 🎓 Built for
Superteam Xandeum pNode Analytics Bounty

## 📄 License
ISC
