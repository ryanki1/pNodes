import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { PRpcService, Pod, NodeStats } from './services/p-rpc.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzTableModule,
    NzProgressModule,
    NzSpinModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  // State signals
  loading = signal(true);
  error = signal<string | null>(null);

  // Data signals
  pods = signal<Pod[]>([]);
  totalCount = signal(0);
  nodeStats = signal<NodeStats | null>(null);

  constructor(private prpcService: PRpcService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.error.set(null);

      console.log('📡 Starting to load pNode data...');
      const data = await this.prpcService.getAllData();
      console.log('✅ Data loaded:', data);

      this.pods.set(data.pods.pods);
      this.totalCount.set(data.pods.pods.length);
      this.nodeStats.set(data.nodeStats);

      console.log(`✅ Dashboard ready: ${data.pods.pods.length} pods loaded`);

    } catch (err) {
      console.error('❌ Error loading data:', err);
      this.error.set(`Failed to load pNode data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.loading.set(false);
    }
  }

  async refresh() {
    await this.loadData();
  }

  // Helper methods
  formatBytes(bytes: number): string {
    return this.prpcService.formatBytes(bytes);
  }

  formatUptime(seconds: number): string {
    return this.prpcService.formatUptime(seconds);
  }

  shortenPubkey(pubkey: string): string {
    return this.prpcService.shortenPubkey(pubkey);
  }

  getTotalStorage(): number {
    return this.pods().reduce((sum, pod) => sum + (pod.storage_used || 0), 0);
  }

  getOnlineCount(): number {
    // Consider a pod online if seen in last 5 minutes
    const fiveMinutesAgo = Date.now() / 1000 - 300;
    return this.pods().filter(pod => (pod.last_seen_timestamp || 0) > fiveMinutesAgo).length;
  }

  getAverageCpu(): number {
    const stats = this.nodeStats();
    return stats ? Math.round(stats.cpu_percent * 10) / 10 : 0;
  }
}
