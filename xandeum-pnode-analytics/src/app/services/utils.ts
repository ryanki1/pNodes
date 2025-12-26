import { NodeStats, Pod } from "./model";
import { ECHARTS_OPTIONS, MAX_BARS, POLL_INTERVAL } from "./constants";

/**
 * Return string of format HH:MM e.g. 12:32
 */
export function get24Clock(date: number): string {
    const hours = new Date(date).getHours();
    const mins = new Date(date).getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
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
export function formatUptime(seconds: number): string {
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
export function formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
}

export function getComboChart(repo: { pods: Pod[]; stats: NodeStats[] }) {
    // Trim to MAX_BARS if needed (sliding window)
    if (repo.stats.length > MAX_BARS) {
      repo.stats = repo.stats.slice(-MAX_BARS);
    }

    // Prepare chart data
    const xAxisData: string[] = [];
    const yAxisTotalBytes: number[] = [];
    const yAxisPacketsSent: number[] = [];
    const yAxisPacketsReceived: number[] = [];

    const totalBars = repo.stats.length;

    repo.stats.forEach((stat, index) => {
      // Calculate relative time labels: rightmost is "now", others are negative offsets
      const isLast = index === totalBars - 1;
      if (isLast) {
        xAxisData.push('now');
      } else {
        const secondsAgo = (totalBars - 1 - index) * (POLL_INTERVAL / 1000);
        xAxisData.push(`-${secondsAgo}s`);
      }

      yAxisTotalBytes.push(stat.total_bytes);
      yAxisPacketsSent.push(stat.packets_sent);
      yAxisPacketsReceived.push(stat.packets_received);
    });

    // Merge with base options and inject data
    return {
      ...ECHARTS_OPTIONS,
      xAxis: {
        ...ECHARTS_OPTIONS.xAxis,
        data: xAxisData,
      },
      series: [
        {
          ...ECHARTS_OPTIONS.series[0],
          data: yAxisTotalBytes,
        },
        {
          ...ECHARTS_OPTIONS.series[1],
          data: yAxisPacketsSent,
        },
        {
          ...ECHARTS_OPTIONS.series[2],
          data: yAxisPacketsReceived,
        },
      ],
    };
  }