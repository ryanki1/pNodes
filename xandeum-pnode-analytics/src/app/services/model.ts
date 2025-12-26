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