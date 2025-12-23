import { Injectable } from '@angular/core';
import { Pod, NodeStats } from './p-rpc.service';
import { get24Clock } from './utils';
import { ECHARTS_OPTIONS, MAX_BARS, ONE_GB, ONE_MB, POLL_INTERVAL } from './constants';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private repo: { timenow?: number; pods: Pod[]; stats: NodeStats[] } = {
    pods: [],
    stats: [],
  };

  /**
   * Generate realistic mock pod data for testing
   */
  generateMockPods(count: number = 25): Pod[] {
    const pods: Pod[] = [];
    const versions = ['v1.0.0', 'v1.0.1', 'v1.1.0', 'v0.9.5'];

    for (let i = 0; i < count; i++) {
      const now = Date.now() / 1000;

      // Generate various last_seen scenarios
      let lastSeenOffset: number;
      const rand = Math.random();
      if (rand < 0.4) {
        // 40% online (<5min)
        lastSeenOffset = Math.random() * 300;
      } else if (rand < 0.6) {
        // 20% recently seen (5min-1h)
        lastSeenOffset = 300 + Math.random() * 3300;
      } else if (rand < 0.8) {
        // 20% seen today (1-24h)
        lastSeenOffset = 3600 + Math.random() * 82800;
      } else {
        // 20% offline (>24h)
        lastSeenOffset = 86400 + Math.random() * 172800;
      }

      // Generate various uptime scenarios
      let uptime: number;
      const uptimeRand = Math.random();
      if (uptimeRand < 0.05) {
        // 5% no uptime
        uptime = 0;
      } else if (uptimeRand < 0.15) {
        // 10% <1h
        uptime = Math.random() * 3600;
      } else if (uptimeRand < 0.35) {
        // 20% 1-24h
        uptime = 3600 + Math.random() * 82800;
      } else if (uptimeRand < 0.6) {
        // 25% 1-7d
        uptime = 86400 + Math.random() * 518400;
      } else {
        // 40% >7d
        uptime = 604800 + Math.random() * 2592000; // 7d to 37d
      }

      // Generate storage (0 to 10GB, some pods with 0)
      let storageUsed: number;
      if (Math.random() < 0.1) {
        // 10% no storage
        storageUsed = 0;
      } else {
        // Varied storage from 100MB to 10GB
        storageUsed = Math.floor(100 * 1024 * 1024 + Math.random() * 10 * 1024 * 1024 * 1024);
      }

      pods.push({
        pubkey: this.generateMockPubkey(),
        address: this.generateMockAddress(),
        last_seen_timestamp: now - lastSeenOffset,
        version: versions[Math.floor(Math.random() * versions.length)],
        storage_used: storageUsed,
        uptime: Math.floor(uptime),
      });
    }

    const timenow = this.repo.timenow ? this.repo.timenow : Date.now();
    this.repo = { ...this.repo, timenow, pods };

    return pods;
  }

  /**
   * Generate realistic mock node stats
   */
  generateMockNodeStats(): NodeStats {
    const mockStats = {
      cpu_percent: Math.random() * 60 + 20, // 20-80% CPU
      ram_used: Math.floor(8 * 1024 * 1024 * 1024 * (0.4 + Math.random() * 0.3)), // 40-70% of 8GB
      ram_total: 8 * 1024 * 1024 * 1024, // 8GB
      uptime: Math.floor(86400 * (7 + Math.random() * 23)), // 7-30 days
      active_streams: Math.floor(10 + Math.random() * 50), // 10-60 streams
      packets_sent: Math.floor(500000 + Math.random() * 1000000), // 500k-1.5M
      packets_received: Math.floor(600000 + Math.random() * 1200000), // 600k-1.8M
      total_bytes: Math.floor(800 * 1024 * 1024 * 1024 * (0.4 + Math.random() * 0.3)), // 40-70% of 800GB
    } as any;

    const stats = this.repo.stats;
    stats.push(mockStats);
    this.repo = { ...this.repo, stats };

    return mockStats;
  }

  /**
   * Generate a realistic-looking Solana public key
   */
  private generateMockPubkey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate a realistic IP address
   */
  private generateMockAddress(): string {
    const octet = () => Math.floor(Math.random() * 255) + 1;
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
  }

  getBarChart() {
    const xAxisData: string[] = [];
    const yAxisTotalBytes: number[] = [];
    const yAxisPacketsSent: number[] = [];
    this.repo.stats.forEach((stat, index) => {
      xAxisData.push(get24Clock((this.repo.timenow || 0) + index * POLL_INTERVAL));
      yAxisTotalBytes.push(stat.total_bytes / ONE_GB); // Changed to MB instead of GB
      yAxisPacketsSent.push(stat.packets_sent / ONE_MB)
    });
    if (this.repo.stats.length > MAX_BARS) {
      this.repo.stats = [...this.repo.stats.slice(-MAX_BARS-1, this.repo.stats.length)];
      this.repo.stats.shift();
      this.repo.timenow = this.repo.timenow! +  POLL_INTERVAL;
      xAxisData.shift();
      yAxisTotalBytes.shift();
      yAxisPacketsSent.shift();
    }
    let options = {
      ...ECHARTS_OPTIONS,
      xAxis: {
        ...ECHARTS_OPTIONS.xAxis,
        data: xAxisData
      },
      series: [
        {
          ...ECHARTS_OPTIONS.series[0],
          data: yAxisTotalBytes,
        },
        {
          ...ECHARTS_OPTIONS.series[1],
          data: yAxisPacketsSent,
        }
      ]
    };
    return options;
  }
}
