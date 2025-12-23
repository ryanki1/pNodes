import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ECHARTS_OPTIONS, MAX_BARS, ONE_GB, ONE_MB, POLL_INTERVAL } from './constants';
import { get24Clock } from './utils';

// TypeScript Interfaces based on real API responses
export interface Pod {
  address?: string;
  pubkey?: string;
  last_seen_timestamp?: number;
  version?: string;
  is_public?: boolean;
  rpc_port?: number;
  storage_committed?: number;
  storage_usage_percent?: number;
  storage_used?: number;
  uptime?: number;
}

export interface PodsResponse {
  total_count?: number;
  pods: Pod[];
}

export interface NodeStats {
  active_streams: number;
  cpu_percent: number;
  current_index: number;
  file_size: number;
  last_updated: number;
  packets_received: number;
  packets_sent: number;
  ram_total: number;
  ram_used: number;
  total_bytes: number;
  total_pages: number;
  uptime: number;
}

@Injectable({
  providedIn: 'root',
})
export class PRpcService {
  // Use local proxy server instead of direct pNode connection
  private readonly baseUrl = 'http://localhost:3001/api';
  private repo: { timenow?: number; pods: Pod[]; stats: NodeStats[] } = {
    pods: [],
    stats: [],
  };

  constructor(private http: HttpClient) {}

  /**
   * Get all pods from the gossip network
   */
  async getPods(): Promise<PodsResponse> {
    try {
      console.log('🌐 Fetching pods from:', `${this.baseUrl}/pods`);
      const response = await firstValueFrom(this.http.get<PodsResponse>(`${this.baseUrl}/pods`));
      console.log('✅ Pods response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching pods:', error);
      throw error;
    }
  }

  /**
   * Get statistics for the connected node
   */
  async getStats(): Promise<NodeStats> {
    try {
      console.log('🌐 Fetching stats from:', `${this.baseUrl}/stats`);
      const response = await firstValueFrom(this.http.get<NodeStats>(`${this.baseUrl}/stats`));
      console.log('✅ Stats response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Get all data (pods + node stats)
   */
  async getAllData(): Promise<{ pods: PodsResponse; nodeStats: NodeStats }> {
    try {
      const [podsResponse, nodeStats] = await Promise.all([this.getPods(), this.getStats()]);
      const timenow = this.repo.timenow ? this.repo.timenow : Date.now();
      const pods = podsResponse.pods;
      const stats = [...this.repo.stats, ...[nodeStats]];
      this.repo = { ...this.repo, timenow, pods, stats };
      return { pods: podsResponse, nodeStats };
    } catch (error) {
      console.error('❌ Error fetching all data:', error);
      throw error;
    }
  }

  /**
   * Find a specific pNode by public key [TODO KR - still required?]
   */
  async findPNode(pubkey: string): Promise<Pod | undefined> {
    try {
      const response = await this.getPods();
      return response.pods.find((pod: Pod) => pod.pubkey === pubkey);
    } catch (error) {
      console.error('Error finding pNode:', error);
      throw error;
    }
  }

  /**
   * Shorten pubkey for display (e.g., "EcTqXg...bKcL")
   */
  shortenPubkey(pubkey: string, startChars: number = 6, endChars: number = 4): string {
    if (pubkey.length <= startChars + endChars) {
      return pubkey;
    }
    return `${pubkey.slice(0, startChars)}...${pubkey.slice(-endChars)}`;
  }

  getBarChart() {
    // Trim to MAX_BARS if needed (sliding window)
    if (this.repo.stats.length > MAX_BARS) {
      this.repo.stats = this.repo.stats.slice(-MAX_BARS);
      this.repo.timenow = this.repo.timenow! + POLL_INTERVAL;
    }

    // Prepare chart data
    const xAxisData: string[] = [];
    const yAxisTotalBytes: number[] = [];
    const yAxisPacketsSent: number[] = [];

    this.repo.stats.forEach((stat, index) => {
      xAxisData.push(get24Clock(this.repo.timenow! + index * POLL_INTERVAL));
      yAxisTotalBytes.push(stat.total_bytes / ONE_GB);
      yAxisPacketsSent.push(stat.packets_sent / ONE_MB);
    });

    // Merge with base options and inject data
    return {
      ...ECHARTS_OPTIONS,
      xAxis: {
        ...ECHARTS_OPTIONS.xAxis,
        data: xAxisData
      },
      series: [
        {
          ...ECHARTS_OPTIONS.series[0],
          data: yAxisTotalBytes
        },
        {
          ...ECHARTS_OPTIONS.series[1],
          data: yAxisPacketsSent
        }
      ]
    };
  }
}
