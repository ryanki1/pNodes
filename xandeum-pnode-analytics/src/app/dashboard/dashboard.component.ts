import { Component, computed, DestroyRef, inject, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';

import { PRpcService, Pod, NodeStats } from '../services/p-rpc.service';
import { MockDataService } from '../services/mock-data.service';
import * as echarts from 'echarts/core';
import { timer } from 'rxjs';
import { POLL_INTERVAL } from '../services/constants';
import { formatBytes, formatUptime } from '../services/utils';
import { EChartsOption } from 'echarts/types/dist/shared';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzTableModule,
    NzProgressModule,
    NzSpinModule,
    NzTabsModule,
    NzSwitchModule,
    NgxChartsModule,
  ],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  // State signals
  loading = signal(true);
  error = signal<string | null>(null);
  isMockMode = signal(false);
  barChartOptions = signal<EChartsOption>({} as EChartsOption);
  backgroundEffectEnabled = signal(true);
  currentDateTime = signal<string>('');

  private destroyRef = inject(DestroyRef);
  private barChart?: echarts.ECharts;
  private isLoadingData = false;

  // Data signals
  pods = signal<Pod[]>([]);
  totalCount = signal(0);
  nodeStats = signal<NodeStats | null>(null);
  legendPosition = LegendPosition;

  // Static table data (only updated via refresh button)
  tableData = signal<Pod[]>([]);

  // Cached chart data (computed signals for performance)
  storageDistribution = computed(() => this.getStorageDistribution());
  versionDistribution = computed(() => this.getVersionDistribution());
  lastSeenDistribution = computed(() => this.getLastSeenDistribution());
  uptimeHealthDistribution = computed(() => this.getUptimeHealthDistribution());
  private ro = new ResizeObserver(() => {
    this.barChart?.resize();
  });

  constructor(
    private prpcService: PRpcService,
    private mockDataService: MockDataService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    // Check if we're in mock mode
    this.isMockMode.set(this.router.url === '/mock');

    // Update date/time every second
    this.updateDateTime();
    timer(0, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateDateTime());

    // Initial load
    await this.loadData();
    // Initialize table with initial data
    this.tableData.set([...this.pods()]);

    timer(0, POLL_INTERVAL)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        // Skip if already loading to prevent overlapping requests
        if (this.isLoadingData) {
          console.log('⏭️ Skipping data load - previous load still in progress');
          return;
        }

        this.isLoadingData = true;

        // Run async to prevent blocking the setInterval handler
        setTimeout(() => {
          this.loadData()
            .then(() => {
              // Initialize chart only once (outside zone for performance)
              if (!this.barChart) {
                this.ngZone.runOutsideAngular(() => {
                  const dom = document.getElementById('barChart');
                  if (dom) {
                    this.ro.observe(dom);
                    this.barChart = echarts.init(dom, null, {
                      renderer: 'svg',
                      useDirtyRect: false,
                    });
                  }
                });
              }

              // Get chart options IN Angular zone (uses computed signals)
              const newOptions = this.isMockMode()
                ? this.mockDataService.getBarChart()
                : this.prpcService.getBarChart();

              // Update signal
              this.barChartOptions.set(newOptions as any);

              // Update chart rendering outside zone for better performance
              if (this.barChart && newOptions) {
                this.ngZone.runOutsideAngular(() => {
                  this.barChart!.setOption(newOptions, {
                    notMerge: false,
                    lazyUpdate: true
                  });
                });
              }
            })
            .catch((err) => {
              console.error('❌ Error in timer subscription:', err);
            })
            .finally(() => {
              this.isLoadingData = false;
            });
        }, 0);
      });
    }

  ngOnDestroy() {
    this.ro.disconnect();
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.error.set(null);

      if (this.isMockMode()) {
        // Mock mode - use generated test data
        console.log('🧪 Loading mock data...');

        // Simulate minimal network delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        const mockPods = this.mockDataService.generateMockPods(25);
        const mockStats = this.mockDataService.generateMockNodeStats();

        this.pods.set(mockPods);
        this.totalCount.set(mockPods.length);
        this.nodeStats.set(mockStats);
        console.log(`✅ Mock data ready: ${mockPods.length} pods generated`);
      } else {
        // Production mode - fetch from API
        console.log('📡 Starting to load pNode data...');
        const data = await this.prpcService.getAllData();
        console.log('✅ Data loaded:', data);

        this.pods.set(data.pods.pods);
        this.totalCount.set(data.pods.pods.length);
        this.nodeStats.set(data.nodeStats);
        console.log(`✅ Dashboard ready: ${data.pods.pods.length} pods loaded`);
      }
    } catch (err) {
      console.error('❌ Error loading data:', err);
      this.error.set(
        `Failed to load pNode data: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      this.loading.set(false);
    }
  }

  async refresh() {
    await this.loadData();
    // Update table data when user clicks refresh
    this.tableData.set([...this.pods()]);
  }


  // Helper methods
  formatBytes(bytes: number): string {
    return formatBytes(bytes);
  }

  formatUptime(seconds: number): string {
    return formatUptime(seconds);
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
    return this.pods().filter((pod) => (pod.last_seen_timestamp || 0) > fiveMinutesAgo).length;
  }

  getAverageCpu(): number {
    const stats = this.nodeStats();
    return stats ? Math.round(stats.cpu_percent * 10) / 10 : 0;
  }

  // ========================================
  // Table Sort Functions
  // ========================================

  sortByPubkey = (a: Pod, b: Pod) => (a.pubkey || '').localeCompare(b.pubkey || '');
  sortByAddress = (a: Pod, b: Pod) => (a.address || '').localeCompare(b.address || '');
  sortByStorage = (a: Pod, b: Pod) => (a.storage_used || 0) - (b.storage_used || 0);
  sortByStoragePercent = (a: Pod, b: Pod) => (a.storage_usage_percent || 0) - (b.storage_usage_percent || 0);
  sortByUptime = (a: Pod, b: Pod) => (a.uptime || 0) - (b.uptime || 0);
  sortByVersion = (a: Pod, b: Pod) => (a.version || '').localeCompare(b.version || '');

  // ========================================
  // Table Filter Configurations (Static)
  // ========================================

  storageFilters = [
    { text: '> 5 GB', value: '>5gb' },
    { text: '> 1 GB', value: '>1gb' },
    { text: '< 1 GB', value: '<1gb' },
    { text: 'No Storage', value: 'none' }
  ];

  storagePercentFilters = [
    { text: '> 80%', value: '>0.8' },
    { text: '> 50%', value: '>0.5' },
    { text: '< 25%', value: '<0.25' },
    { text: '0%', value: '0' }
  ];

  uptimeFilters = [
    { text: '> 7 days', value: '>7d' },
    { text: '> 1 day', value: '>1d' },
    { text: '> 1 hour', value: '>1h' },
    { text: '< 1 hour', value: '<1h' },
    { text: 'No Uptime', value: 'none' }
  ];

  // ========================================
  // Table Filter Functions (Simple)
  // ========================================

  filterByStorage = (value: string, item: Pod): boolean => {
    const storage = item.storage_used || 0;
    const oneGB = 1024 * 1024 * 1024;

    switch (value) {
      case '>5gb': return storage > 5 * oneGB;
      case '>1gb': return storage > oneGB;
      case '<1gb': return storage < oneGB && storage > 0;
      case 'none': return storage === 0;
      default: return true;
    }
  };

  filterByStoragePercent = (value: string, item: Pod): boolean => {
    const percent = item.storage_usage_percent || 0;

    switch (value) {
      case '>0.8': return percent > 0.8;
      case '>0.5': return percent > 0.5;
      case '<0.25': return percent < 0.25 && percent > 0;
      case '0': return percent === 0;
      default: return true;
    }
  };

  filterByUptime = (value: string, item: Pod): boolean => {
    const uptime = item.uptime || 0;

    switch (value) {
      case '>7d': return uptime > 7 * 24 * 3600;
      case '>1d': return uptime > 24 * 3600;
      case '>1h': return uptime > 3600 && uptime <= 24 * 3600;
      case '<1h': return uptime < 3600 && uptime > 0;
      case 'none': return uptime === 0;
      default: return true;
    }
  };

  // ========================================
  // Chart Data Preparation Methods
  // ========================================

  /**
   * Chart 1: Storage Distribution (Pie Chart)
   * Shows top 5 pods by storage + "Others"
   */
  getStorageDistribution(): { name: string; value: number }[] {
    const pods = this.pods();
    if (pods.length === 0) return [];

    // Sort by storage_used descending
    const sorted = [...pods].sort((a, b) => (b.storage_used || 0) - (a.storage_used || 0));

    // Take top 5
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);

    const chartData = top5.map((pod) => ({
      name: this.shortenPubkey(pod.pubkey || 'Unknown'),
      value: pod.storage_used || 0,
    }));

    // Add "Others" if there are more than 5 pods
    if (others.length > 0) {
      const othersTotal = others.reduce((sum, pod) => sum + (pod.storage_used || 0), 0);
      chartData.push({
        name: 'Others',
        value: othersTotal,
      });
    }

    return chartData;
  }

  /**
   * Chart 2: Version Distribution (Pie Chart)
   * Shows which versions are running in the network
   */
  getVersionDistribution(): { name: string; value: number }[] {
    const pods = this.pods();
    if (pods.length === 0) return [];

    const versionCounts = new Map<string, number>();

    pods.forEach((pod) => {
      const version = pod.version || 'Unknown';
      versionCounts.set(version, (versionCounts.get(version) || 0) + 1);
    });

    return Array.from(versionCounts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }

  /**
   * Chart 3: Last Seen Distribution (Bar Chart)
   * Shows when pods were last seen (network reachability)
   */
  getLastSeenDistribution(): { name: string; value: number }[] {
    const pods = this.pods();
    if (pods.length === 0) return [];

    const now = Date.now() / 1000;
    const ranges = {
      '<5min': 0,
      '5min-1h': 0,
      '1-24h': 0,
      '>24h': 0,
    };

    pods.forEach((pod) => {
      const lastSeen = pod.last_seen_timestamp || 0;
      const ageSeconds = now - lastSeen;
      const ageMinutes = ageSeconds / 60;
      const ageHours = ageMinutes / 60;

      if (ageMinutes < 5) {
        ranges['<5min']++;
      } else if (ageMinutes < 60) {
        ranges['5min-1h']++;
      } else if (ageHours < 24) {
        ranges['1-24h']++;
      } else {
        ranges['>24h']++;
      }
    });

    return Object.entries(ranges).map(([name, value]) => ({
      name,
      value,
    }));
  }

  /**
   * Chart 4: Uptime Health Distribution (Pie Chart)
   * Shows how long pods have been running (stability)
   */
  getUptimeHealthDistribution(): { name: string; value: number }[] {
    const pods = this.pods();
    if (pods.length === 0) return [];

    const ranges = {
      'No Uptime': 0,
      '<1h': 0,
      '1-24h': 0,
      '1-7d': 0,
      '>7d': 0,
    };

    pods.forEach((pod) => {
      const uptime = pod.uptime || 0;

      if (uptime === 0) {
        ranges['No Uptime']++;
      } else {
        const hours = uptime / 3600;
        const days = hours / 24;

        if (hours < 1) {
          ranges['<1h']++;
        } else if (hours < 24) {
          ranges['1-24h']++;
        } else if (days < 7) {
          ranges['1-7d']++;
        } else {
          ranges['>7d']++;
        }
      }
    });

    return Object.entries(ranges).map(([name, value]) => ({
      name,
      value,
    }));
  }

  hasData(chartData: { name: string, value: number }[]): boolean {
    return chartData.some(item => item.value > 0);
  }

  updateDateTime(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    this.currentDateTime.set(now.toLocaleString('de-DE', options));
  }
}
