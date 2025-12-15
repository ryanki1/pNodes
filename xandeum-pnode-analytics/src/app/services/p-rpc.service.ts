import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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
  providedIn: 'root'
})
export class PRpcService {
  // Use local proxy server instead of direct pNode connection
  private readonly baseUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all pods from the gossip network
   */
  async getPods(): Promise<PodsResponse> {
    try {
      console.log('🌐 Fetching pods from:', `${this.baseUrl}/pods`);
      const response = await firstValueFrom(
        this.http.get<PodsResponse>(`${this.baseUrl}/pods`)
      );
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
      const response = await firstValueFrom(
        this.http.get<NodeStats>(`${this.baseUrl}/stats`)
      );
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
      const [pods, nodeStats] = await Promise.all([initi<lis 
        this.getPods(),
        this.getStats()
      ]);

      return { pods, nodeStats };
    } catch (error) {
      console.error('❌ Error fetching all data:', error);
      throw error;
    }
  }

  /**
   * Find a specific pNode by public key
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
   * Format bytes to human-readable string
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format uptime (seconds) to human-readable string
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Format timestamp to date string
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
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
}
