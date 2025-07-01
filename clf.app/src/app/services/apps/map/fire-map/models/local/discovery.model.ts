import { LocalEndpoint } from './local-endpoint.model';

export enum DiscoveryMethod {
  Manual = 'manual',
  Scan = 'scan',
  MDNS = 'mdns'
}

export interface DiscoveryResult {
  endpoints: LocalEndpoint[];
  discoveryMethod: 'mdns' | 'scan' | 'manual';
  timestamp: Date;
} 