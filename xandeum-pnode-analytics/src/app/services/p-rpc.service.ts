import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NodeStats, Pod, PodsResponse } from './model';
import { getComboChart } from './utils';

@Injectable({
  providedIn: 'root',
})
export class PRpcService {
  // Use local proxy server instead of direct pNode connection
  private readonly baseUrl = 'http://localhost:3001/api';
  private repo: { pods: Pod[]; stats: NodeStats[] } = {
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
      const pods = podsResponse.pods;
      const stats = [...this.repo.stats, ...[nodeStats]];
      this.repo = { ...this.repo, pods, stats };
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

  getComboChart() {
    return getComboChart(this.repo);
  }
}
