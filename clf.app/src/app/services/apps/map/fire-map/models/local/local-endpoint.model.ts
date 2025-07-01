export interface LocalEndpoint {
  url: string;
  priority: number;
  healthy: boolean;
  lastChecked: Date;
  responseTime: number;
  capabilities: string[];
  region?: string;
}

export interface LocalNetworkConfig {
  discoveryMethods: ('mdns' | 'scan' | 'manual')[];
  scanRanges: string[];
  commonPorts: number[];
  healthCheckInterval: number;
  discoveryInterval: number;
  manualEndpoints: string[];
} 