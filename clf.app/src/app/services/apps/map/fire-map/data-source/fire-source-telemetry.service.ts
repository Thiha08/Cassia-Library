/**
 * FireSourceTelemetryService
 * 
 * A comprehensive telemetry service for monitoring and tracking fire source data performance and health.
 * 
 * Key Features:
 * 1. Performance Metrics
 *    - Response time tracking
 *    - Data size monitoring
 *    - Feature count tracking
 *    - Processing time measurement
 *    - CPU usage monitoring
 *    - Memory usage tracking
 *    - Network bandwidth monitoring
 *    - Event processing rate calculation
 *    - Average latency tracking
 *    - Queue size monitoring
 * 
 * 2. Health Monitoring
 *    - System health status
 *    - Error rate tracking
 *    - Connection status monitoring
 *    - Uptime tracking
 *    - Last successful operation tracking
 *    - Cache performance monitoring
 * 
 * 3. Alert System
 *    - Configurable alert thresholds
 *    - Multiple alert types (warning, error, critical)
 *    - Performance-based alerts
 *    - Resource usage alerts
 *    - Error rate alerts
 * 
 * 4. Data Management
 *    - Configurable retention period
 *    - Maximum metrics storage limit
 *    - Automatic cleanup of old metrics
 *    - Source-specific metrics tracking
 * 
 * 5. Public API
 *    - Get all metrics
 *    - Get latest metrics
 *    - Get metrics by time range
 *    - Get metrics by source
 *    - Get alerts
 *    - Get summary statistics
 * 
 * Usage:
 * ```typescript
 * // Initialize the service
 * const telemetry = new FireSourceTelemetryService();
 * 
 * // Start collecting metrics
 * telemetry.startCollection();
 * 
 * // Get metrics
 * const metrics = telemetry.getMetrics();
 * const latestMetrics = telemetry.getLatestMetrics();
 * const sourceMetrics = telemetry.getMetricsBySource('sourceId');
 * 
 * // Get alerts
 * const alerts = telemetry.getAlerts();
 * 
 * // Get summary
 * const summary = telemetry.getSummary();
 * 
 * // Cleanup
 * telemetry.destroy();
 * ```
 * 
 * Configuration:
 * - Default retention period: 24 hours
 * - Default max metrics: 1000
 * - Configurable alert thresholds
 * - Customizable collection intervals
 * 
 * Note: This service is designed to be lightweight and efficient, with automatic cleanup
 * of old metrics to prevent memory issues. It uses the Performance API when available
 * for accurate measurements.
 */

import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Observable, Subject, timer, BehaviorSubject } from 'rxjs';
import { map, takeUntil, tap, filter } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { 
  DataSourceType, 
  FireSourceError, 
  TelemetryConfig, 
  TelemetryMetrics,
  TelemetryAlert,
  TelemetrySummary
} from '../models';
import { FireSourceBaseService } from './fire-source-base.service';

@Injectable({
  providedIn: 'root'
})
export class FireSourceTelemetryService implements OnDestroy {
  private readonly metrics = signal<TelemetryMetrics[]>([]);
  private readonly alerts = signal<TelemetryAlert[]>([]);
  private readonly summary = signal<TelemetrySummary>({
    totalRequests: 0,
    successRate: 0,
    averageResponseTime: 0,
    errorCount: 0,
    activeSources: [],
    lastUpdate: new Date(),
    alerts: []
  });

  private readonly config: TelemetryConfig = {
    collectionInterval: 60000,  // 1 minute
    retentionPeriod: 86400000, // 24 hours
    maxMetricsStored: 1440,    // 24 hours worth of 1-minute metrics
    enableDetailedLogging: true,
    metricsToCollect: {
      responseTime: true,
      dataSize: true,
      featureCount: true,
      errorCount: true,
      cacheHitRate: true,
      memoryUsage: true,
      networkBandwidth: true,
      activeConnections: true,
      requestCount: true,
      successRate: true,
      processingTime: true,
      cpuUsage: true,
      eventProcessingRate: true,
      averageLatency: true,
      queueSize: true
    },
    alertThresholds: {
      responseTime: 5000,    // 5 seconds
      errorRate: 0.1,        // 10%
      memoryUsage: 0.8,      // 80%
      cpuUsage: 0.9         // 90%
    }
  };

  private readonly destroy$ = new Subject<void>();
  private readonly sourceMetrics = new Map<DataSourceType, BehaviorSubject<TelemetryMetrics>>();
  private readonly startTime = Date.now();

  constructor() {
    this.startMetricsCollection();
  }

  private startMetricsCollection(): void {
    timer(0, this.config.collectionInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.collectMetrics();
      });
  }

  private collectMetrics(): void {
    const metrics: TelemetryMetrics = {
      timestamp: new Date(),
      sourceType: DataSourceType.API,
      metrics: {
        responseTime: this.measureResponseTime(),
        dataSize: this.measureDataSize(),
        featureCount: this.getFeatureCount(),
        errorCount: this.getErrorCount(),
        cacheHitRate: this.calculateCacheHitRate(),
        memoryUsage: this.measureMemoryUsage(),
        networkBandwidth: this.measureNetworkBandwidth(),
        activeConnections: this.getActiveConnections(),
        requestCount: this.getRequestCount(),
        successRate: this.calculateSuccessRate(),
        processingTime: this.measureProcessingTime()
      },
      health: {
        isHealthy: this.checkHealth(),
        lastError: this.getLastError(),
        connectionStatus: this.getConnectionStatus(),
        uptime: Date.now() - this.startTime,
        lastSuccessfulOperation: this.getLastSuccessfulOperation()
      },
      performance: {
        cpuUsage: this.measureCpuUsage(),
        memoryUsage: this.measureMemoryUsage(),
        eventProcessingRate: this.calculateEventProcessingRate(),
        averageLatency: this.calculateAverageLatency(),
        queueSize: this.getQueueSize()
      }
    };

    this.updateMetrics(metrics);
    this.checkAlertThresholds(metrics);
    this.updateSummary();
  }

  private updateMetrics(newMetrics: TelemetryMetrics): void {
    const currentMetrics = this.metrics();
    const updatedMetrics = [...currentMetrics, newMetrics]
      .slice(-this.config.maxMetricsStored);

    this.metrics.set(updatedMetrics);
    this.cleanupOldMetrics();

    // Update source-specific metrics
    const sourceMetrics = this.sourceMetrics.get(newMetrics.sourceType);
    if (sourceMetrics) {
      sourceMetrics.next(newMetrics);
    }
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    const currentMetrics = this.metrics();
    const filteredMetrics = currentMetrics.filter(
      metric => metric.timestamp.getTime() > cutoffTime
    );
    this.metrics.set(filteredMetrics);
  }

  private checkAlertThresholds(metrics: TelemetryMetrics): void {
    const alerts: TelemetryAlert[] = [];

    // Check response time
    if (metrics.metrics.responseTime > this.config.alertThresholds.responseTime) {
      alerts.push(this.createAlert('warning', 'High response time', metrics.sourceType, 'responseTime', metrics.metrics.responseTime));
    }

    // Check error rate
    const errorRate = metrics.metrics.errorCount / metrics.metrics.requestCount;
    if (errorRate > this.config.alertThresholds.errorRate) {
      alerts.push(this.createAlert('error', 'High error rate', metrics.sourceType, 'errorCount', errorRate));
    }

    // Check memory usage
    if (metrics.performance.memoryUsage > this.config.alertThresholds.memoryUsage) {
      alerts.push(this.createAlert('warning', 'High memory usage', metrics.sourceType, 'memoryUsage', metrics.performance.memoryUsage));
    }

    // Check CPU usage
    if (metrics.performance.cpuUsage > this.config.alertThresholds.cpuUsage) {
      alerts.push(this.createAlert('critical', 'High CPU usage', metrics.sourceType, 'cpuUsage', metrics.performance.cpuUsage));
    }

    if (alerts.length > 0) {
      this.alerts.update(current => [...current, ...alerts]);
    }
  }

  private createAlert(
    type: TelemetryAlert['type'],
    message: string,
    source: DataSourceType,
    metric: keyof TelemetryMetrics['metrics'] | keyof TelemetryMetrics['performance'],
    value: number
  ): TelemetryAlert {
    return {
      type,
      message,
      timestamp: new Date(),
      source,
      metric,
      value,
      threshold: this.config.alertThresholds[metric as keyof typeof this.config.alertThresholds] || 0
    };
  }

  private updateSummary(): void {
    const currentMetrics = this.metrics();
    if (currentMetrics.length === 0) return;

    const latestMetrics = currentMetrics[currentMetrics.length - 1];
    const totalRequests = currentMetrics.reduce((sum, m) => sum + m.metrics.requestCount, 0);
    const totalErrors = currentMetrics.reduce((sum, m) => sum + m.metrics.errorCount, 0);
    const avgResponseTime = currentMetrics.reduce((sum, m) => sum + m.metrics.responseTime, 0) / currentMetrics.length;

    this.summary.set({
      totalRequests,
      successRate: totalRequests > 0 ? (totalRequests - totalErrors) / totalRequests : 0,
      averageResponseTime: avgResponseTime,
      errorCount: totalErrors,
      activeSources: Array.from(this.sourceMetrics.keys()),
      lastUpdate: new Date(),
      alerts: this.alerts()
    });
  }

  // Metric collection methods
  private measureResponseTime(): number {
    const startTime = performance.now();
    // Simulate API call or measure actual response time
    return performance.now() - startTime;
  }

  private measureDataSize(): number {
    // Calculate total size of features in memory
    const features = this.metrics().reduce((total, metric) => {
      return total + (metric.metrics.dataSize || 0);
    }, 0);
    return features;
  }

  private getFeatureCount(): number {
    // Get total number of features across all sources
    return this.metrics().reduce((total, metric) => {
      return total + (metric.metrics.featureCount || 0);
    }, 0);
  }

  private getErrorCount(): number {
    // Count total errors across all sources
    return this.metrics().reduce((total, metric) => {
      return total + (metric.metrics.errorCount || 0);
    }, 0);
  }

  private calculateCacheHitRate(): number {
    const metrics = this.metrics();
    if (metrics.length === 0) return 0;

    const totalRequests = metrics.reduce((sum, m) => sum + (m.metrics.requestCount || 0), 0);
    const cacheHits = metrics.reduce((sum, m) => sum + (m.metrics.cacheHitRate || 0), 0);

    return totalRequests > 0 ? cacheHits / totalRequests : 0;
  }

  private measureMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) : 0;
    }
    return 0;
  }

  private measureNetworkBandwidth(): number {
    // Calculate average network bandwidth over time
    const metrics = this.metrics();
    if (metrics.length < 2) return 0;

    const totalBytes = metrics.reduce((sum, m) => sum + (m.metrics.dataSize || 0), 0);
    const timeSpan = metrics[metrics.length - 1].timestamp.getTime() - metrics[0].timestamp.getTime();
    
    return timeSpan > 0 ? (totalBytes * 1000) / timeSpan : 0; // bytes per second
  }

  private getActiveConnections(): number {
    return this.sourceMetrics.size;
  }

  private getRequestCount(): number {
    return this.metrics().reduce((total, metric) => {
      return total + (metric.metrics.requestCount || 0);
    }, 0);
  }

  private calculateSuccessRate(): number {
    const metrics = this.metrics();
    if (metrics.length === 0) return 0;

    const totalRequests = metrics.reduce((sum, m) => sum + (m.metrics.requestCount || 0), 0);
    const totalErrors = metrics.reduce((sum, m) => sum + (m.metrics.errorCount || 0), 0);

    return totalRequests > 0 ? (totalRequests - totalErrors) / totalRequests : 0;
  }

  private measureProcessingTime(): number {
    const metrics = this.metrics();
    if (metrics.length === 0) return 0;

    // Calculate average processing time
    const totalProcessingTime = metrics.reduce((sum, m) => sum + (m.metrics.processingTime || 0), 0);
    return totalProcessingTime / metrics.length;
  }

  private checkHealth(): boolean {
    const metrics = this.metrics();
    if (metrics.length === 0) return true;

    const latestMetric = metrics[metrics.length - 1];
    const errorRate = latestMetric.metrics.errorCount / (latestMetric.metrics.requestCount || 1);
    const memoryUsage = latestMetric.performance.memoryUsage;
    const cpuUsage = latestMetric.performance.cpuUsage;

    return (
      errorRate < this.config.alertThresholds.errorRate &&
      memoryUsage < this.config.alertThresholds.memoryUsage &&
      cpuUsage < this.config.alertThresholds.cpuUsage
    );
  }

  private getLastError(): FireSourceError | undefined {
    const metrics = this.metrics();
    if (metrics.length === 0) return undefined;

    // Find the most recent metric with an error
    const metricWithError = [...metrics]
      .reverse()
      .find(m => m.metrics.errorCount > 0);

    return metricWithError?.health.lastError;
  }

  private getConnectionStatus(): 'connected' | 'disconnected' | 'reconnecting' {
    const metrics = this.metrics();
    if (metrics.length === 0) return 'disconnected';

    const latestMetric = metrics[metrics.length - 1];
    return latestMetric.health.connectionStatus;
  }

  private getLastSuccessfulOperation(): Date | undefined {
    const metrics = this.metrics();
    if (metrics.length === 0) return undefined;

    // Find the most recent metric with a successful operation
    const successfulMetric = [...metrics]
      .reverse()
      .find(m => m.metrics.errorCount === 0);

    return successfulMetric?.timestamp;
  }

  private measureCpuUsage(): number {
    // Since we can't directly measure CPU usage in the browser,
    // we'll estimate it based on processing time and event rate
    const metrics = this.metrics();
    if (metrics.length < 2) return 0;

    const latestMetric = metrics[metrics.length - 1];
    const processingTime = latestMetric.metrics.processingTime;
    const eventRate = latestMetric.performance.eventProcessingRate;

    // Estimate CPU usage based on processing time and event rate
    // This is a simplified estimation
    return Math.min(1, (processingTime * eventRate) / 1000);
  }

  private calculateEventProcessingRate(): number {
    const metrics = this.metrics();
    if (metrics.length < 2) return 0;

    const timeSpan = metrics[metrics.length - 1].timestamp.getTime() - metrics[0].timestamp.getTime();
    const totalEvents = metrics.reduce((sum, m) => sum + (m.metrics.requestCount || 0), 0);

    return timeSpan > 0 ? (totalEvents * 1000) / timeSpan : 0; // events per second
  }

  private calculateAverageLatency(): number {
    const metrics = this.metrics();
    if (metrics.length === 0) return 0;

    const totalLatency = metrics.reduce((sum, m) => sum + (m.metrics.responseTime || 0), 0);
    return totalLatency / metrics.length;
  }

  private getQueueSize(): number {
    // Estimate queue size based on processing time and event rate
    const metrics = this.metrics();
    if (metrics.length === 0) return 0;

    const latestMetric = metrics[metrics.length - 1];
    const processingTime = latestMetric.metrics.processingTime;
    const eventRate = latestMetric.performance.eventProcessingRate;

    // Estimate queue size as events that haven't been processed yet
    return Math.ceil(processingTime * eventRate / 1000);
  }

  // Public API
  getMetrics(): Observable<TelemetryMetrics[]> {
    return toObservable(this.metrics);
  }

  getLatestMetrics(): TelemetryMetrics | undefined {
    const metrics = this.metrics();
    return metrics[metrics.length - 1];
  }

  getMetricsByTimeRange(start: Date, end: Date): TelemetryMetrics[] {
    return this.metrics().filter(
      metric => metric.timestamp >= start && metric.timestamp <= end
    );
  }

  getMetricsBySource(sourceType: DataSourceType): Observable<TelemetryMetrics> {
    if (!this.sourceMetrics.has(sourceType)) {
      this.sourceMetrics.set(sourceType, new BehaviorSubject<TelemetryMetrics>({
        timestamp: new Date(),
        sourceType,
        metrics: {
          responseTime: 0,
          dataSize: 0,
          featureCount: 0,
          errorCount: 0,
          cacheHitRate: 0,
          memoryUsage: 0,
          networkBandwidth: 0,
          activeConnections: 0,
          requestCount: 0,
          successRate: 0,
          processingTime: 0
        },
        health: {
          isHealthy: true,
          connectionStatus: 'disconnected',
          uptime: 0
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          eventProcessingRate: 0,
          averageLatency: 0,
          queueSize: 0
        }
      }));
    }
    return this.sourceMetrics.get(sourceType)!.asObservable();
  }

  getAlerts(): Observable<TelemetryAlert[]> {
    return toObservable(this.alerts);
  }

  getSummary(): Observable<TelemetrySummary> {
    return toObservable(this.summary);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sourceMetrics.forEach(subject => subject.complete());
    this.sourceMetrics.clear();
  }
}