import { Observable } from 'rxjs';
import { FireEvent, DataSourceType, FireSourceError } from '../base/fire-source-base.model';

export interface TelemetryData {
  timestamp: Date;
  location: {
    lat: number;
    lon: number;
    altitude?: number;
  };
  sensors: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    windSpeed?: number;
    windDirection?: number;
  };
  metadata: {
    deviceId: string;
    batteryLevel?: number;
    signalStrength?: number;
    [key: string]: any;
  };
}

export interface TelemetryBatch {
  deviceId: string;
  data: TelemetryData[];
  batchId: string;
  timestamp: Date;
}

export interface TelemetryMetrics {
  timestamp: Date;
  sourceType: DataSourceType;
  metrics: {
    responseTime: number;
    dataSize: number;
    featureCount: number;
    errorCount: number;
    cacheHitRate: number;
    memoryUsage: number;
    networkBandwidth: number;
    activeConnections: number;
    requestCount: number;
    successRate: number;
    processingTime: number;
  };
  health: {
    isHealthy: boolean;
    lastError?: FireSourceError;
    connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
    uptime: number;
    lastSuccessfulOperation?: Date;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    eventProcessingRate: number;
    averageLatency: number;
    queueSize: number;
  };
}

export interface TelemetryConfig {
  collectionInterval: number;  // milliseconds
  retentionPeriod: number;    // milliseconds
  maxMetricsStored: number;   // number of metrics to keep
  enableDetailedLogging: boolean;
  metricsToCollect: {
    responseTime: boolean;
    dataSize: boolean;
    featureCount: boolean;
    errorCount: boolean;
    cacheHitRate: boolean;
    memoryUsage: boolean;
    networkBandwidth: boolean;
    activeConnections: boolean;
    requestCount: boolean;
    successRate: boolean;
    processingTime: boolean;
    cpuUsage: boolean;
    eventProcessingRate: boolean;
    averageLatency: boolean;
    queueSize: boolean;
  };
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface TelemetryState {
  connected: boolean;
  lastUpdate: Date;
  batteryLevel?: number;
  signalStrength?: number;
  error?: string;
}

export interface TelemetryResult {
  events: FireEvent[];
  telemetry: TelemetryData[];
  stats: {
    processed: number;
    duration: number;
  };
}

export type TelemetryObservable = Observable<TelemetryResult>;

export interface TelemetryAlert {
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  source: DataSourceType;
  metric: keyof TelemetryMetrics['metrics'] | keyof TelemetryMetrics['performance'];
  value: number;
  threshold: number;
}

export interface TelemetrySummary {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  activeSources: DataSourceType[];
  lastUpdate: Date;
  alerts: TelemetryAlert[];
}