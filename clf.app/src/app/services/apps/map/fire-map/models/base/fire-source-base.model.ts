import { Extent } from "ol/extent";
import { Observable } from "rxjs";
import { Feature } from "ol";

export interface FireSourceStats {
  count: number;
  lastUpdate: Date;
  source: DataSourceType;
  cacheable: boolean;
}

export interface SourceStats {
  totalEvents: number;
  lastUpdate: Date;
}

export interface FireSourceParams {
  bbox?: [number, number, number, number];
  range?: {
    from: Date;
    to: Date;
  };
  filters?: Record<string, any>;
}

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface FireSourceError {
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  recoverable?: boolean;
}

export interface RetryStrategy {
  maxAttempts: number;
  backoffMs: number;
  exponential: boolean;
}

export enum DataSourceType {
  API = 'api',
  REALTIME = 'realtime',
  LOCAL_NETWORK = 'local-network',
  CACHE = 'cache'
}

export interface ConnectionStatus {
  connected: boolean;
  endpoint?: string;
  lastConnected?: Date;
  errorCount: number;
}

export interface DataSourceCapabilities {
  supportsRealtime: boolean;
  supportsLocalNetwork: boolean;
  supportsCaching: boolean;
  supportsFiltering: boolean;
  supportsBoundingBox: boolean;
  maxConcurrentRequests: number;
  updateInterval: number;
}

export interface FireGeometry {
  type: 'Point';
  coordinates: [number, number];
}

export interface FireProperties {
  timestamp: string;
  confidence: number;
  brightness: number;
  intensity: number;
  size?: number;
  containment?: number;
  smokeDirection?: number;
  smokeIntensity?: number;
  [key: string]: any;
}

export interface FireEvent {
  id?: string;
  source?: DataSourceType | string;
  type: 'Feature';
  township: string;
  geometry: FireGeometry;
  properties: FireProperties;
}

// RxJS related types
export interface FireSourceState {
  loading: boolean;
  error: FireSourceError | null;
  features: readonly FireEvent[];
  connectionStatus: ConnectionStatus;
}

export interface FireSourceResult {
  events: readonly FireEvent[];
  stats: SourceStats;
  state: FireSourceState;
}

export type DataSourcePriority = 'api' | 'realtime' | 'local-network' | 'cache' | 'auto';

export interface ManagerConfig {
  preferredSource: DataSourcePriority;
  enableAutoFallback: boolean;
  cacheStrategy: 'aggressive' | 'conservative' | 'disabled';
  realtimeEnabled: boolean;
  healthCheckInterval: number;
}

export interface SourceHealth {
  sourceType: DataSourceType;
  healthy: boolean;
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
}

export interface FireSourceManagerState {
  events: readonly FireEvent[];
  loading: boolean;
  error: FireSourceError | null;
  activeSource: DataSourceType | null;
  sourceHealth: SourceHealth[];
  stats: SourceStats;
}

export type FireSourceObservable = Observable<FireSourceResult>;
export type FireFeatureObservable = Observable<readonly FireEvent[]>;
