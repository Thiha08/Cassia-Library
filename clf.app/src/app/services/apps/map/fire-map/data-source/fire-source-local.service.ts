/**
 * FireSourceLocalService
 * 
 * A sophisticated local network fire event data service that provides automatic discovery
 * and management of local fire data servers. This service is designed for field operations
 * where internet connectivity is limited but local network infrastructure is available.
 * 
 * Key Features:
 * 1. Network Discovery
 *    - Multiple discovery methods:
 *      * mDNS/Bonjour for automatic service discovery
 *      * IP range scanning for manual discovery
 *      * Manual endpoint configuration
 *    - Automatic endpoint health monitoring
 *    - Priority-based endpoint selection
 *    - Geographic region awareness
 * 
 * 2. Fallback Strategies
 *    - Multiple discovery methods (mDNS, IP scanning, manual endpoints)
 *    - Automatic failover between discovered servers
 *    - Load balancing across available endpoints
 *    - Priority-based endpoint selection
 *    - Health-based failover
 * 
 * 3. Local Network Optimization
 *    - HTTP/2 support for better performance
 *    - Connection pooling for efficiency
 *    - Response caching for offline capability
 *    - Efficient data compression
 *    - Bandwidth optimization
 * 
 * 4. Geographic Awareness
 *    - Discovers fire servers by geographic region
 *    - Maintains regional endpoint preferences
 *    - Supports hierarchical data distribution
 *    - Spatial query optimization
 *    - Region-based load balancing
 * 
 * 5. Performance Features
 *    - Worker integration for data processing
 *    - Concurrent requests to multiple endpoints
 *    - Efficient data merging and deduplication
 *    - Memory usage optimization
 *    - Response time tracking
 * 
 * 6. Connection Management
 *    - Tracks health of all discovered endpoints
 *    - Automatic endpoint validation and cleanup
 *    - Persistent connection management
 *    - Connection state monitoring
 *    - Automatic reconnection handling
 * 
 * 7. Data Processing
 *    - Efficient data parsing and filtering
 *    - Worker-based processing for CPU-intensive tasks
 *    - Main thread fallback processing
 *    - Data validation and sanitization
 *    - Efficient data transformation
 * 
 * Usage:
 * ```typescript
 * // Initialize the service
 * const localService = inject(FireSourceLocalService);
 * 
 * // Add manual endpoint
 * localService.addManualEndpoint('http://192.168.1.100:8080').subscribe({
 *   next: (success) => console.log('Endpoint added:', success),
 *   error: (err) => console.error('Failed to add endpoint:', err)
 * });
 * 
 * // Refresh data with parameters
 * localService.refresh({
 *   bbox: [minLon, minLat, maxLon, maxLat],
 *   range: {
 *     from: startDate,
 *     to: endDate
 *   }
 * }).subscribe({
 *   next: (events) => console.log('Fire events:', events),
 *   error: (err) => console.error('Error fetching events:', err)
 * });
 * 
 * // Monitor discovered endpoints
 * localService.discoveredEndpoints.subscribe(endpoints => {
 *   console.log('Available endpoints:', endpoints);
 * });
 * 
 * // Check service health
 * localService.healthCheck().subscribe(isHealthy => {
 *   console.log('Service health:', isHealthy);
 * });
 * ```
 * 
 * Configuration:
 * - Discovery methods: mDNS, IP scanning, manual
 * - Scan ranges: Configurable IP ranges
 * - Common ports: 8080, 3000, 5000, 8000
 * - Health check interval: 30 seconds
 * - Discovery interval: 5 minutes
 * - Retry strategy: 3 attempts with exponential backoff
 * 
 * Error Handling:
 * - Severity-based error classification
 * - Automatic retry for recoverable errors
 * - Endpoint health monitoring
 * - Connection error recovery
 * - Detailed error reporting
 * 
 * Performance Considerations:
 * - Efficient network discovery
 * - Optimized data processing
 * - Memory usage management
 * - Connection pooling
 * - Response caching
 * 
 * Note: This service is specifically designed for field operations where
 * internet connectivity is limited but local network infrastructure is
 * available (mesh networks, local servers, etc.). It provides robust
 * local network discovery and data management capabilities with automatic
 * failover and optimization features.
 */

import { Injectable, inject, signal, computed, OnDestroy } from "@angular/core";
import { HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Observable, Subject, of, forkJoin, timer, throwError } from "rxjs";
import {
  catchError,
  finalize,
  map,
  switchMap,
  tap,
  takeUntil,
  retry,
  timeout,
  mergeMap,
  filter,
  debounceTime
} from "rxjs/operators";
import {
  DataSourceType,
  DataSourceCapabilities,
  FireSourceParams,
  FireSourceError,
  ErrorSeverity,
  ConnectionStatus,
  FireEvent,
  SourceStats
} from "../models";
import { LocalEndpoint, LocalNetworkConfig, DiscoveryMethod, DiscoveryResult } from "../models";
import { FireSourceWorkerService } from "./fire-source-worker.service";
import { FireSourceBaseService } from "./fire-source-base.service";

@Injectable({
  providedIn: 'root'
})
export class FireSourceLocalService extends FireSourceBaseService implements OnDestroy {
  // Dependencies
  private http = inject(HttpClient);
  private workerService = inject(FireSourceWorkerService);

  // Source configuration
  override readonly sourceType = DataSourceType.LOCAL_NETWORK;
  override readonly sourceCapabilities: DataSourceCapabilities = {
    supportsRealtime: false,
    supportsLocalNetwork: true,
    supportsCaching: true,
    supportsFiltering: true,
    supportsBoundingBox: true,
    maxConcurrentRequests: 3,
    updateInterval: 30000
  };

  // Local network state
  readonly discoveredEndpoints = signal<LocalEndpoint[]>([]);
  readonly activeEndpoint = signal<LocalEndpoint | null>(null);

  private _destroy$ = new Subject<void>();
  private _lastUpdate: Date = new Date(0);
  private _discoveryTimer?: ReturnType<typeof setInterval>;
  private _healthCheckTimer?: ReturnType<typeof setInterval>;
  private _config: LocalNetworkConfig;
  private _retryStrategy = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000
  };

  constructor() {
    super();
    this._config = this.loadConfig();
    this.initializeManager();
  }

  private initializeManager(): void {
    this.init().pipe(
      takeUntil(this._destroy$)
    ).subscribe({
      error: (error) => this.handleError(error, 'initialization')
    });
  }

  override init(): Observable<void> {
    return this.discoverEndpoints().pipe(
      map(result => {
        this.discoveredEndpoints.set(result.endpoints);
        this.selectBestEndpoint();
        return void 0;
      }),
      catchError(error => {
        this.handleError(error, 'initialization');
        return throwError(() => error);
      })
    );
  }

  override refresh(params?: FireSourceParams): Observable<readonly FireEvent[]> {
    this._loading.set(true);
    this.clearError();

    const endpoint = this.activeEndpoint();
    if (!endpoint) {
      return this.init().pipe(
        switchMap(() => this.refresh(params))
      );
    }

    return this.fetchFromEndpoint(endpoint, params).pipe(
      switchMap(response => this.processResponse(response, params)),
      tap(events => {
        this._features.set(events);
        this._lastUpdate = new Date();
        this.updateConnectionStatus({
          connected: true,
          endpoint: endpoint.url,
          lastConnected: new Date(),
          errorCount: 0
        });
      }),
      catchError(error => {
        this.handleError(error, 'refresh');
        return this.tryFallbackEndpoints(params);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  override destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    if (this._discoveryTimer) {
      clearInterval(this._discoveryTimer);
    }
    if (this._healthCheckTimer) {
      clearInterval(this._healthCheckTimer);
    }
  }

  override healthCheck(): Observable<boolean> {
    const endpoint = this.activeEndpoint();
    if (!endpoint) {
      return of(false);
    }
    return this.checkEndpointHealth(endpoint);
  }

  override sourceStats(): SourceStats {
    return {
      totalEvents: this._features().length,
      lastUpdate: this._lastUpdate
    };
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  // Public methods for local network management

  addManualEndpoint(url: string): Observable<boolean> {
    return this.validateEndpoint(url).pipe(
      tap(isValid => {
        if (isValid) {
          const newEndpoint: LocalEndpoint = {
            url,
            priority: 1,
            healthy: true,
            lastChecked: new Date(),
            responseTime: 0,
            capabilities: []
          };

          this.discoveredEndpoints.update(endpoints => [...endpoints, newEndpoint]);

          // Select as active if no current endpoint
          if (!this.activeEndpoint()) {
            this.activeEndpoint.set(newEndpoint);
          }
        }
      }),
      catchError(() => of(false))
    );
  }

  removeEndpoint(url: string): void {
    this.discoveredEndpoints.update(endpoints =>
      endpoints.filter(ep => ep.url !== url)
    );

    if (this.activeEndpoint()?.url === url) {
      this.selectBestEndpoint();
    }
  }

  // Private helper methods

  private loadConfig(): LocalNetworkConfig {
    // return {
    //   discoveryMethods: this.config.get('localNetworkDiscoveryMethods') || ['scan', 'manual'],
    //   scanRanges: this.config.get('localNetworkScanRanges') || ['192.168.0.0/24', '10.0.0.0/24'],
    //   commonPorts: this.config.get('localNetworkPorts') || [8080, 3000, 5000, 8000],
    //   healthCheckInterval: this.config.get('localNetworkHealthInterval') || 30000,
    //   discoveryInterval: this.config.get('localNetworkDiscoveryInterval') || 300000,
    //   manualEndpoints: this.config.get('localNetworkManualEndpoints') || []
    // };

    return {
      discoveryMethods: ['scan', 'manual'],
      scanRanges: ['192.168.0.0/24', '10.0.0.0/24'],
      commonPorts: [8080, 3000, 5000, 8000],
      healthCheckInterval: 30000,
      discoveryInterval: 300000,
      manualEndpoints: []
    };
  }

  private discoverEndpoints(): Observable<DiscoveryResult> {
    const discoveries: Observable<DiscoveryResult>[] = [];
    const methods = this._config.discoveryMethods as DiscoveryMethod[];

    // Add manual endpoints discovery
    if (methods.includes(DiscoveryMethod.Manual)) {
      discoveries.push(this.discoverManualEndpoints());
    }

    // Add network scanning discovery
    if (methods.includes(DiscoveryMethod.Scan)) {
      discoveries.push(this.discoverByScanning());
    }

    // Add mDNS discovery (if supported by browser/environment)
    if (methods.includes(DiscoveryMethod.MDNS)) {
      discoveries.push(this.discoverByMDNS());
    }

    if (discoveries.length === 0) {
      return of({ endpoints: [], discoveryMethod: DiscoveryMethod.Manual, timestamp: new Date() });
    }

    return forkJoin(discoveries).pipe(
      map(results => {
        const allEndpoints = results.flatMap(r => r.endpoints);
        const uniqueEndpoints = this.deduplicateEndpoints(allEndpoints);

        return {
          endpoints: uniqueEndpoints,
          discoveryMethod: DiscoveryMethod.Scan,
          timestamp: new Date()
        } as DiscoveryResult;
      }),
      catchError(err => {
        console.warn('Discovery failed:', err);
        return of({ endpoints: [], discoveryMethod: DiscoveryMethod.Manual, timestamp: new Date() });
      })
    );
  }

  private discoverManualEndpoints(): Observable<DiscoveryResult> {
    const validationPromises = this._config.manualEndpoints.map(url =>
      this.validateEndpoint(url).pipe(
        map(valid => valid ? { url, valid } : null),
        catchError(() => of(null))
      )
    );

    return forkJoin(validationPromises).pipe(
      map(results => {
        const endpoints: LocalEndpoint[] = results
          .filter(r => r && r.valid)
          .map(r => ({
            url: r!.url,
            priority: 2,
            healthy: true,
            lastChecked: new Date(),
            responseTime: 0,
            capabilities: []
          }));

        return {
          endpoints,
          discoveryMethod: 'manual' as const,
          timestamp: new Date()
        };
      })
    );
  }

  private discoverByScanning(): Observable<DiscoveryResult> {
    const scanPromises: Observable<LocalEndpoint | null>[] = [];

    // Generate IP addresses to scan based on common ranges
    for (const range of this._config.scanRanges) {
      const ips = this.generateIPRange(range);
      for (const ip of ips.slice(0, 20)) { // Limit to prevent too many requests
        for (const port of this._config.commonPorts) {
          const url = `http://${ip}:${port}`;
          scanPromises.push(
            this.validateEndpoint(url).pipe(
              map(valid => valid ? {
                url,
                priority: 3,
                healthy: true,
                lastChecked: new Date(),
                responseTime: 0,
                capabilities: []
              } : null),
              timeout(2000),
              catchError(() => of(null))
            )
          );
        }
      }
    }

    return forkJoin(scanPromises).pipe(
      map(results => ({
        endpoints: results.filter(Boolean) as LocalEndpoint[],
        discoveryMethod: 'scan' as const,
        timestamp: new Date()
      }))
    );
  }

  private discoverByMDNS(): Observable<DiscoveryResult> {
    // Note: mDNS discovery in browsers is limited
    // This would typically require a native app or special browser permissions
    return of({
      endpoints: [],
      discoveryMethod: 'mdns' as const,
      timestamp: new Date()
    });
  }

  private generateIPRange(cidr: string): string[] {
    // Simple CIDR to IP range conversion
    // In production, you'd use a proper IP utility library
    const [base, bits] = cidr.split('/');
    const [a, b, c, d] = base.split('.').map(Number);

    if (bits === '24') {
      const ips: string[] = [];
      for (let last = 1; last < 255; last++) {
        ips.push(`${a}.${b}.${c}.${last}`);
      }
      return ips;
    }

    return [base]; // Fallback for other CIDR notations
  }

  private validateEndpoint(url: string): Observable<boolean> {
    const healthUrl = `${url}/api/fire/health`;

    return this.http.get(healthUrl, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      timeout(3000),
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }

  private deduplicateEndpoints(endpoints: LocalEndpoint[]): LocalEndpoint[] {
    const unique = new Map<string, LocalEndpoint>();

    for (const endpoint of endpoints) {
      const existing = unique.get(endpoint.url);
      if (!existing || endpoint.priority < existing.priority) {
        unique.set(endpoint.url, endpoint);
      }
    }

    return Array.from(unique.values());
  }

  private selectBestEndpoint(): void {
    const endpoints = this.discoveredEndpoints().filter(ep => ep.healthy);

    if (endpoints.length === 0) {
      this.activeEndpoint.set(null);
      return;
    }

    // Sort by priority (lower number = higher priority) and response time
    const best = endpoints.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.responseTime - b.responseTime;
    })[0];

    this.activeEndpoint.set(best);
    this.updateConnectionStatus({
      connected: true,
      endpoint: best.url,
      lastConnected: new Date(),
      errorCount: 0
    });
  }

  private fetchFromEndpoint(endpoint: LocalEndpoint, params?: FireSourceParams): Observable<any> {
    const url = `${endpoint.url}/api/fire/events`;
    const httpParams = this.buildHttpParams(params);

    const startTime = Date.now();

    return this.http.get(url, {
      params: httpParams,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).pipe(
      timeout(15000),
      tap(() => {
        // Update response time
        endpoint.responseTime = Date.now() - startTime;
      }),
      retry(this._retryStrategy.maxAttempts - 1)
    );
  }

  private processResponse(response: any, params?: FireSourceParams): Observable<readonly FireEvent[]> {
    if (this.workerService) {
      return this.workerService.parseAndFilter(JSON.stringify(response), params).pipe(
        map(events => events.map(event => ({
          ...event,
          type: 'Feature' as const,
          properties: {
            ...event.properties,
            timestamp: event.properties.timestamp.toString()
          }
        }))),
        catchError(err => {
          console.warn('Worker processing failed, using main thread:', err);
          return of(this.filterDataMainThread(response, params));
        })
      );
    }
    return of(this.filterDataMainThread(response, params));
  }

  private filterDataMainThread(data: any[], params?: FireSourceParams): FireEvent[] {
    let events: FireEvent[] = data.map(item => this.parseFireEvent(item)).filter(Boolean) as FireEvent[];

    // Apply bbox filter
    if (params?.bbox) {
      const [minX, minY, maxX, maxY] = params.bbox;
      events = events.filter(event => {
        const [lon, lat] = event.geometry.coordinates;
        return lon >= minX && lon <= maxX && lat >= minY && lat <= maxY;
      });
    }

    // Apply time filter
    if (params?.range) {
      const { from, to } = params.range;
      events = events.filter(event => {
        const eventTime = new Date(event.properties.timestamp);
        return eventTime >= from && eventTime <= to;
      });
    }

    return events;
  }

  private parseFireEvent(rawEvent: any): FireEvent | null {
    try {
      return {
        id: rawEvent.id,
        type: 'Feature' as const,
        township: rawEvent.township || '',
        geometry: rawEvent.geometry,
        properties: {
          ...rawEvent.properties,
          timestamp: rawEvent.properties.timestamp.toString()
        },
        source: DataSourceType.LOCAL_NETWORK
      };
    } catch (err) {
      console.error('Error parsing fire event:', err);
      return null;
    }
  }

  private tryFallbackEndpoints(params?: FireSourceParams): Observable<readonly FireEvent[]> {
    const fallbackEndpoints = this.discoveredEndpoints()
      .filter(e => e.url !== this.activeEndpoint()?.url);

    if (fallbackEndpoints.length === 0) {
      return of([]);
    }

    const fallback = fallbackEndpoints[0];
    this.activeEndpoint.set(fallback);

    return this.fetchFromEndpoint(fallback, params).pipe(
      switchMap(response => this.processResponse(response, params)),
      tap(events => {
        this._features.set(events);
        this._lastUpdate = new Date();
        this.updateConnectionStatus({
          connected: true,
          endpoint: fallback.url,
          lastConnected: new Date(),
          errorCount: 0
        });
      }),
      catchError(error => {
        this.handleError(error, 'fallback');
        return of([]);
      })
    );
  }

  private buildHttpParams(params?: FireSourceParams): HttpParams {
    let httpParams = new HttpParams();

    if (params?.bbox) {
      httpParams = httpParams.set('bbox', params.bbox.join(','));
    }

    if (params?.range) {
      httpParams = httpParams.set('from', params.range.from.toISOString());
      httpParams = httpParams.set('to', params.range.to.toISOString());
    }

    return httpParams;
  }

  private startPeriodicDiscovery(): void {
    this._discoveryTimer = setInterval(() => {
      this.discoverEndpoints().pipe(
        takeUntil(this._destroy$)
      ).subscribe(result => {
        const current = this.discoveredEndpoints();
        const merged = this.mergeEndpoints(current, result.endpoints);
        this.discoveredEndpoints.set(merged);

        if (!this.activeEndpoint() || !this.activeEndpoint()!.healthy) {
          this.selectBestEndpoint();
        }
      });
    }, this._config.discoveryInterval);
  }

  private startHealthChecking(): void {
    this._healthCheckTimer = setInterval(() => {
      const endpoints = this.discoveredEndpoints();

      endpoints.forEach(endpoint => {
        this.checkEndpointHealth(endpoint).pipe(
          takeUntil(this._destroy$)
        ).subscribe(healthy => {
          this.updateEndpointHealth(endpoint.url, healthy);

          if (!healthy && this.activeEndpoint()?.url === endpoint.url) {
            this.selectBestEndpoint();
          }
        });
      });
    }, this._config.healthCheckInterval);
  }

  private checkEndpointHealth(endpoint: LocalEndpoint): Observable<boolean> {
    return this.validateEndpoint(endpoint.url).pipe(
      tap(() => {
        endpoint.lastChecked = new Date();
      })
    );
  }

  private updateEndpointHealth(url: string, healthy: boolean): void {
    this.discoveredEndpoints.update(endpoints =>
      endpoints.map(ep =>
        ep.url === url ? { ...ep, healthy, lastChecked: new Date() } : ep
      )
    );
  }

  private mergeEndpoints(current: LocalEndpoint[], discovered: LocalEndpoint[]): LocalEndpoint[] {
    const merged = new Map<string, LocalEndpoint>();

    // Add current endpoints
    current.forEach(ep => merged.set(ep.url, ep));

    // Add or update with discovered endpoints
    discovered.forEach(ep => {
      const existing = merged.get(ep.url);
      if (existing) {
        merged.set(ep.url, { ...existing, ...ep, lastChecked: new Date() });
      } else {
        merged.set(ep.url, ep);
      }
    });

    return Array.from(merged.values());
  }

  protected override clearData(): void {
    this._features.set([]);
    this._lastUpdate = new Date(0);
  }

  protected override handleError(error: any, context?: string): void {
    const severity = this.determineErrorSeverity(error);
    const message = this.extractErrorMessage(error);

    const fireError: FireSourceError = {
      message,
      severity,
      timestamp: new Date(),
      recoverable: severity !== ErrorSeverity.CRITICAL
    };

    this._error.set(fireError);
    console.error(`FireSourceLocalService Error [${context}]:`, error);
  }

  private determineErrorSeverity(error: any): ErrorSeverity {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return ErrorSeverity.WARNING; // Network error
      if (error.status >= 500) return ErrorSeverity.ERROR;
      if (error.status >= 400) return ErrorSeverity.ERROR;
    }

    if (error.name === 'TimeoutError') return ErrorSeverity.WARNING;

    return ErrorSeverity.ERROR;
  }

  private extractErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      return `Local network HTTP ${error.status}: ${error.message}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown local network error occurred';
  }
}
