# Xandeum pNode Analytics Dashboard

A real-time monitoring dashboard for the Xandeum pNode network, featuring advanced data visualizations and a SETI-inspired design theme.

## Overview

This Angular-based dashboard provides comprehensive monitoring and analytics for Xandeum pNodes, displaying real-time network statistics, pod information, and interactive charts. The visual design is inspired by the SETI (Search for Extraterrestrial Intelligence) project, which, like Xandeum, leverages distributed networks of home computers to accomplish ambitious goals.

### SETI Connection

The background imagery and overall aesthetic draw inspiration from NASA's SETI program. Just as SETI harnesses the collective computing power of home PCs worldwide through distributed computing to search for signals from space, Xandeum creates a decentralized network of pNodes running on consumer hardware. Both projects demonstrate the power of distributed networks and community participation in achieving groundbreaking technological objectives. The radio telescope array and nebula backgrounds serve as a visual tribute to this shared philosophy.

## Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Angular CLI** (v21.0.3)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd pNodes
```

### Step 2: Install Dependencies

```bash
npm install
cd xandeum-pnode-analytics && npm install && cd ..
```

This will install all required dependencies for both the Angular frontend and Express backend.

### Step 3: Start the Application

The application requires both the backend proxy server and the Angular development server to be running.

#### Option A: Start Both Servers Concurrently (Recommended)

```bash
npm run dev
```

This single command starts:
- Express backend server on `http://localhost:3001`
- Angular frontend on `http://localhost:4200`

#### Option B: Start Servers Separately

**Terminal 1 - Backend Server:**
```bash
npm run proxy
```

**Terminal 2 - Angular Frontend:**
```bash
npm run frontend
```

### Step 4: Access the Dashboard

Open your browser and navigate to:
```
http://localhost:4200
```

The dashboard will automatically connect to the backend proxy server and begin fetching pNode data.

### Test Mode

For testing without a live pNode connection, access the test mode by navigating to:

```
http://localhost:4200/mock
```

Test mode includes:
- 25 simulated pods with realistic metrics
- Randomized uptime, storage, and version data
- Continuous data generation for testing charts
- **TEST MODE** badge displayed in the header

## Features

### Real-Time Monitoring
- Live network statistics updated every 10 seconds
- Node performance metrics (CPU, RAM, uptime, active streams)
- Automatic data refresh with visual loading states

### Interactive Data Visualizations
1. **Network Activity Over Time** - ECharts bar and stacked area chart showing:
   - Total Bytes transferred (GB)
   - Packets Sent and Packets Received (with smart unit formatting: Pkts, kPkts, MPkts, GPkts)
   - Sliding time window showing last 10 data points
   - Custom tooltip with formatted values

2. **Storage Distribution** - Pie chart displaying storage usage across pods
   - Shows top 5 pods by storage usage
   - Aggregates remaining pods as "Others"

3. **Version Distribution** - Doughnut chart showing pNode software version distribution
   - Hollow center design for modern aesthetic
   - Color-coded version segments

4. **Last Seen Distribution** - Vertical bar chart categorizing pod activity by time ranges
   - Time ranges: < 1h, 1h-1d, 1d-7d, > 7d
   - Clear visualization of network activity patterns

5. **Uptime Health Distribution** - Doughnut chart visualizing pod uptime statistics
   - Categories: < 1 hour, 1 hour - 1 day, 1 day - 7 days, > 7 days
   - Hollow center design matching Version Distribution

### Advanced Table Features
- Sortable columns for all data fields
- Multi-criteria filtering (storage, uptime, usage percentage)
- Pagination support (10 items per page)
- Responsive horizontal scrolling
- Shortened public key display with full hover information

### User Experience
- **SETI-Themed Backgrounds**: Space imagery (radio telescope array in light mode, nebula in dark mode)
- **Background Toggle**: Switch between themed backgrounds and solid colors
- **Dark/Light Mode**: Automatic system preference detection with custom styling
- **Mobile Responsive**: Optimized layouts for screens down to 375px (iPhone 8)
- **Live DateTime Display**: Real-time clock in German locale

## Technology Stack

### Frontend Framework
- **Angular 18+** with standalone components and Signals API
- **TypeScript** for type-safe development
- **RxJS** for reactive data streams

### UI Components & Styling
- **ng-zorro-antd** (Ant Design) - Enterprise-grade UI components with icon system
- **SCSS** with CSS variables, media queries, and responsive design
- Custom glassmorphism effects (0.85 opacity cards)

### Data Visualization
- **Apache ECharts** - High-performance SVG charts with stacked area charts
- **@swimlane/ngx-charts** - Additional chart components for pie and bar visualizations

### Performance Optimizations
- **NgZone** optimization for chart rendering (runs outside Angular change detection)
- **ResizeObserver** for responsive chart resizing
- **Computed Signals** for efficient derived state management
- **takeUntilDestroyed** for automatic RxJS subscription cleanup

### Backend Integration
- **Express.js** proxy server (port 3001)
- **xandeum-prpc** library for pNode communication
- **CORS** enabled for cross-origin requests

## Architecture

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

## Project Structure

```
pNodes/
├── proxy-server.js                      # Express proxy for pRPC API
├── test-prpc.js                         # pRPC connection test script
├── package.json                         # Root dependencies
└── xandeum-pnode-analytics/             # Angular application
    ├── src/
    │   ├── app/
    │   │   ├── dashboard/               # Main dashboard component
    │   │   │   ├── dashboard.component.ts
    │   │   │   ├── dashboard.component.html
    │   │   │   └── dashboard.component.scss
    │   │   └── services/
    │   │       ├── p-rpc.service.ts     # Real pNode API service
    │   │       ├── mock-data.service.ts # Mock data generator
    │   │       ├── constants.ts         # ECharts config & constants
    │   │       └── utils.ts             # Utility functions
    │   └── assets/
    │       └── images/
    │           ├── array.jpg            # SETI radio telescope array (232 KB)
    │           ├── nebula.jpg           # Space nebula background (313 KB)
    │           └── xandeum.png          # Xandeum logo (3.3 KB)
    └── package.json
```

## Configuration

### Backend Server Configuration

The Express proxy server is configured in `proxy-server.js`:

```javascript
const PNODE_ADDRESS = '173.212.220.65';  // Default pNode address
const PORT = 3001;                        // Backend server port
```

To connect to a different pNode, modify the `PNODE_ADDRESS` in `proxy-server.js`.

### Frontend Configuration

Frontend settings are in `xandeum-pnode-analytics/src/app/services/constants.ts`:

```typescript
export const POLL_INTERVAL = 10000;  // Data refresh interval (ms)
export const MAX_BARS = 10;          // Chart data points to display
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run proxy` | Start Express backend server only |
| `npm run frontend` | Start Angular development server only |
| `npm run build` | Build production-ready application |
| `npm test` | Run unit tests with Vitest |

## Mobile Support

The dashboard is fully responsive and optimized for:
- Desktop displays (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (375px - 767px)

Mobile optimizations include:
- Adjusted font sizes and spacing
- Repositioned controls to prevent overlap
- Responsive grid layouts
- Touch-friendly interface elements

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dark Mode

The dashboard automatically detects system dark mode preferences and applies appropriate styling:
- Light mode: Radio telescope array background
- Dark mode: Nebula background with adjusted text colors

Users can toggle the background effect on/off using the switch in the header.

## Performance Considerations

- Charts render outside Angular's change detection zone for optimal performance
- Data is fetched every 10 seconds to balance real-time updates with server load
- Sliding window displays only the last 10 data points to maintain chart readability
- Image assets optimized (JPG format, ~200-300 KB each)

## Building for Production

```bash
npm run build
```

Production build artifacts are stored in `dist/` directory with:
- Minified JavaScript bundles
- Optimized CSS
- Compressed assets
- AOT (Ahead-of-Time) compilation

## Troubleshooting

### Backend Connection Issues

If the dashboard shows "Error fetching data":
1. Ensure the Express server is running (`npm run proxy`)
2. Check that port 3001 is available
3. Verify pNode address is correct in `proxy-server.js`

### CORS Errors

The Express server has CORS enabled by default. If you encounter CORS issues:
1. Check that the backend is running on port 3001
2. Verify the frontend is accessing `http://localhost:3001/api`

### Chart Not Displaying

If charts don't render:
1. Check browser console for errors
2. Ensure window is fully loaded
3. Verify data is being received from the backend

## License

This project is developed for the Xandeum competition.

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Apache ECharts Documentation](https://echarts.apache.org/)
- [ng-zorro-antd Components](https://ng.ant.design/)
- [Xandeum Documentation](https://xandeum.com)
- [SETI@home Project](https://setiathome.berkeley.edu/)
