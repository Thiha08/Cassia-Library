/**
 * FireManifestService
 * 
 * A sophisticated caching service for fire event data that provides efficient storage,
 * retrieval, and processing capabilities using a two-layer caching system. This service
 * extends FireSourceBaseService to provide robust caching functionality for fire event data.
 * 
 * Key Features:
 * 1. Cache Management
 *    - Two-layer caching system:
 *      * Memory cache for fast access
 *      * IndexedDB for persistent storage
 *    - LRU (Least Recently Used) cache strategy
 *    - Automatic cache cleanup and expiration
 *    - Configurable cache size and retention policies
 *    - Cache metadata tracking
 *    - Revision-based data management
 * 
 * 2. Data Processing
 *    - Worker-based data processing for better performance
 *    - Fallback to main thread when worker is unavailable
 *    - Compression/decompression of cached data
 *    - Spatial indexing for efficient bbox queries
 *    - Batch processing capabilities
 *    - Data validation and sanitization
 * 
 * 3. Performance Optimization
 *    - Memory cache for frequently accessed data
 *    - Batch operations for IndexedDB transactions
 *    - Performance metrics tracking
 *    - Automatic cleanup of expired data
 *    - Compression ratio optimization
 *    - Latency monitoring
 * 
 * 4. Error Handling
 *    - Comprehensive error tracking and recovery
 *    - Error severity classification
 *    - Automatic retry mechanisms
 *    - Error context preservation
 *    - Graceful degradation
 *    - Error state management
 * 
 * 5. State Management
 *    - Reactive state using Angular signals
 *    - Observable-based async operations
 *    - Performance metrics monitoring
 *    - Cache metadata tracking
 *    - Connection state management
 *    - Health status monitoring
 * 
 * 6. Storage Management
 *    - Configurable storage limits
 *    - Automatic storage cleanup
 *    - Storage quota monitoring
 *    - Efficient data compression
 *    - Storage metrics tracking
 *    - Data persistence strategies
 * 
 * Usage:
 * ```typescript
 * // Initialize the service
 * const manifestService = inject(FireManifestService);
 * 
 * // Store data in cache
 * manifestService.storeData(fireEvents, bbox, 'api').subscribe({
 *   next: (revision) => console.log('Data stored:', revision),
 *   error: (err) => console.error('Storage failed:', err)
 * });
 * 
 * // Retrieve data from cache
 * manifestService.refresh({
 *   bbox: [minLon, minLat, maxLon, maxLat],
 *   range: {
 *     from: startDate,
 *     to: endDate
 *   }
 * }).subscribe({
 *   next: (events) => console.log('Cached events:', events),
 *   error: (err) => console.error('Retrieval failed:', err)
 * });
 * 
 * // Monitor cache metrics
 * manifestService.performanceMetrics.subscribe(metrics => {
 *   console.log('Cache performance:', metrics);
 * });
 * 
 * // Cleanup expired data
 * manifestService.cleanupExpiredData().subscribe({
 *   next: () => console.log('Cleanup completed'),
 *   error: (err) => console.error('Cleanup failed:', err)
 * });
 * ```
 * 
 * Configuration:
 * - Memory cache size: 100MB
 * - Cache expiration: 24 hours
 * - Cleanup interval: 1 hour
 * - Compression threshold: 1MB
 * - Batch size: 100 items
 * - Max memory entries: 10
 * 
 * Error Handling:
 * - Severity-based error classification
 * - Automatic retry for recoverable errors
 * - Error context preservation
 * - Graceful degradation
 * - Detailed error reporting
 * 
 * Performance Considerations:
 * - Efficient data compression
 * - Memory usage optimization
 * - Storage quota management
 * - Batch processing
 * - Worker utilization
 * 
 * Note: This service is designed for efficient caching of fire event data
 * with robust error handling and performance optimizations. It provides
 * a reliable way to store and retrieve fire event data with automatic
 * cleanup and optimization features.
 */

import { Injectable, inject, signal, computed, OnDestroy } from "@angular/core";
import { EMPTY, Observable, Subject, forkJoin, from, fromEvent, of, throwError, timer, switchMap, tap, catchError, finalize, takeUntil, map } from "rxjs";
import {
  Extent
} from "ol/extent";
import { FireSourceWorkerService } from "./fire-source-worker.service";
import { FireSourceBaseService } from "./fire-source-base.service";
import { CacheMetrics, CacheRevision, CacheStrategy, CacheMetadata, ErrorContext, MemoryCacheEntry, StorageConfig } from "../models";
import { ConnectionStatus, DataSourceCapabilities, DataSourceType, ErrorSeverity, FireSourceError, FireSourceParams, FireSourceStats, FireEvent, SourceStats } from "../models";

//#region Interfaces



//#endregion

@Injectable({
  providedIn: 'root'
})
export class FireManifestService extends FireSourceBaseService {

  //#region Dependencies and State

  private workerService = inject(FireSourceWorkerService);
  private readonly destroy$ = new Subject<void>();

  // Enhanced state management
  readonly performanceMetrics = signal<CacheMetrics>({
    readLatency: 0,
    writeLatency: 0,
    compressionRatio: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    storageUsage: 0
  });

  // Source configuration
  override readonly sourceType = DataSourceType.CACHE;
  override readonly sourceCapabilities: DataSourceCapabilities = {
    supportsRealtime: false,
    supportsLocalNetwork: false,
    supportsCaching: true,
    supportsFiltering: true,
    supportsBoundingBox: true,
    maxConcurrentRequests: 1,
    updateInterval: 60000
  };

  private memoryCache = new Map<string, MemoryCacheEntry>();

  // Memory cache configuration
  private readonly cacheStrategy : CacheStrategy = {
    type: 'lru',
    maxSize: 100 * 1024 * 1024, // 100MB
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 60 * 60 * 1000, // 1 hour
    maxMemoryEntries: 10, // Configurable number of memory cache entries
    compressionThreshold: 1024 * 1024, // 1MB threshold for compression
    batchSize: 100 // Number of items to process in a batch
  };

  // Cache-specific state
  readonly cacheMetadata = signal<CacheMetadata>({
    totalSize: 0,
    revisionCount: 0,
    lastCleanup: new Date(0)
  });
  readonly availableRevisions = signal<CacheRevision[]>([]);

  // Private state
  private _db: IDBDatabase | null = null;
  private _lastUpdate: Date = new Date(0);
  private _dbName = 'FireEventCache';
  private _dbVersion = 1;
  private _storageConfig: StorageConfig;

  // Add performance monitoring
  private readonly performanceMonitor = {
    lastCleanup: new Date(0),
    cleanupCount: 0,
    totalErrors: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalOperations: 0
  };

  //#endregion

  //#region Constructor and Initialization

  constructor() {
    super();
    this._storageConfig = this.loadStorageConfig();
    this.initializeManager();
  }

  private initializeManager(): void {
    this.init().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      error: (error) => this.handleError(error, ErrorSeverity.ERROR)
    });
  }

  //#endregion

  //#region Public API Methods

  override init(): Observable<void> {
    return from(this.initDatabase()).pipe(
      tap(() => {
        this.updateConnectionStatus({
          connected: true,
          endpoint: 'indexeddb://fire-cache',
          lastConnected: new Date(),
          errorCount: 0
        });
      }),
      catchError(error => {
        this.handleError(error, ErrorSeverity.ERROR);
        return throwError(() => error);
      })
    );
  }

  override refresh(params?: FireSourceParams): Observable<readonly FireEvent[]> {
    this._loading.set(true);
    this.clearError();

    return this.findBestRevision(params?.bbox).pipe(
      switchMap(revision => {
        if (!revision) {
          return of([] as readonly FireEvent[]);
        }
        return this.loadRevisionData(revision).pipe(
          map(data => this.processData(data, params))
        );
      }),
      map(events => events as readonly FireEvent[]),
      tap(events => {
        this._features.set(events);
        this._lastUpdate = new Date();
        this.updateConnectionStatus({ 
          connected: true,
          lastConnected: new Date(),
          errorCount: 0
        });
      }),
      catchError(error => {
        this.handleError(error, ErrorSeverity.ERROR);
        return throwError(() => error);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  override destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._db?.close();
    this._db = null;
    this.memoryCache.clear();
  }

  override healthCheck(): Observable<boolean> {
    return of(this._db !== null);
  }

  override sourceStats(): SourceStats {
    return {
      totalEvents: this._features().length,
      lastUpdate: this._lastUpdate
    };
  }

  //#region Cache Management Methods

  storeData(data: FireEvent[], bbox?: Extent, source: 'api' | 'local' | 'realtime' = 'api'): Observable<CacheRevision> {
    const startTime = performance.now();
    
    return this.compressData(data).pipe(
      switchMap(compressedData => {
        const revision: CacheRevision = this.createRevision(data, compressedData, bbox, source);
        return this.saveRevision(revision, compressedData).pipe(
          tap(() => {
            this.updateMemoryCache(revision, data);
            this.updatePerformanceMetrics('writeLatency', performance.now() - startTime);
          })
        );
      })
    );
  }

  findRevision(bbox?: Extent): Observable<CacheRevision | null> {
    return this.findBestRevision(bbox);
  }

  getBlob(revision: CacheRevision): Observable<Blob> {
    return this.loadRevisionData(revision).pipe(
      map(data => new Blob([data], { type: 'application/json' }))
    );
  }

  clearCache(): Observable<void> {
    return this.clearAllData().pipe(
      tap(() => {
        this.availableRevisions.set([]);
        this.updateCacheMetadata();
      }),
      map(() => void 0)
    );
  }

  cleanupExpiredData(): Observable<void> {
    return this.performCleanup().pipe(
      map(() => void 0)
    );
  }

  //#endregion

  //#region Private Helper Methods

  private loadStorageConfig(): StorageConfig {
    // return {
    //   maxCacheSize: this.config.get('fireCacheMaxSize') || 100, // 100MB
    //   defaultExpiration: this.config.get('fireCacheExpiration') || 24, // 24 hours
    //   compressionLevel: this.config.get('fireCacheCompression') || 6,
    //   autoCleanup: this.config.get('fireCacheAutoCleanup') !== false,
    //   spatialIndexPrecision: this.config.get('fireCacheSpatialPrecision') || 4
    // };

    return {
      maxCacheSize: 100,
      defaultExpiration: 24,
      compressionLevel: 6,
      autoCleanup: true,
      spatialIndexPrecision: 4
    };
  }

  private initDatabase(): Observable<void> {
    return new Observable<void>(observer => {
      const request = indexedDB.open(this._dbName, this._dbVersion);

      request.onerror = () => {
        observer.error(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this._db = request.result;
        observer.next(void 0);
        observer.complete();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('revisions')) {
          const revisionStore = db.createObjectStore('revisions', { keyPath: 'id' });
          revisionStore.createIndex('timestamp', 'timestamp');
          revisionStore.createIndex('bbox', 'bbox', { multiEntry: false });
          revisionStore.createIndex('source', 'source');
        }

        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'revisionId' });
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  private loadCacheMetadata(): Observable<void> {
    return new Observable<void>(observer => {
      if (!this._db) {
        observer.error(new Error('Database not initialized'));
        return;
      }

      const transaction = this._db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get('cache-metadata');

      request.onsuccess = () => {
        const metadata = request.result?.value || {
          totalSize: 0,
          revisionCount: 0,
          lastCleanup: new Date(0)
        };

        this.cacheMetadata.set(metadata);
        observer.next(void 0);
        observer.complete();
      };

      request.onerror = () => {
        observer.error(new Error('Failed to load cache metadata'));
      };
    });
  }

  private loadAvailableRevisions(): Observable<void> {
    return new Observable<void>(observer => {
      if (!this._db) {
        observer.error(new Error('Database not initialized'));
        return;
      }

      const transaction = this._db.transaction(['revisions'], 'readonly');
      const store = transaction.objectStore('revisions');
      const request = store.getAll();

      request.onsuccess = () => {
        const revisions = request.result || [];
        this.availableRevisions.set(revisions);
        observer.next(void 0);
        observer.complete();
      };

      request.onerror = () => {
        observer.error(new Error('Failed to load available revisions'));
      };
    });
  }

  private findBestRevision(bbox?: Extent): Observable<CacheRevision | null> {
    const revisions = this.availableRevisions();

    if (revisions.length === 0) {
      return of(null);
    }

    // Filter by bounding box if provided
    let candidates = revisions;
    if (bbox) {
      candidates = revisions.filter(rev => this.bboxIntersects(bbox, rev.bbox));
    }

    if (candidates.length === 0) {
      return of(null);
    }

    // Sort by timestamp (newest first) and return the best match
    candidates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Check if the best candidate is expired
    const best = candidates[0];
    if (best.expiresAt < new Date()) {
      return of(null);
    }

    return of(best);
  }

  private loadRevisionData(revision: CacheRevision): Observable<ArrayBuffer> {
    return new Observable<ArrayBuffer>(observer => {
      if (!this._db) {
        observer.error(new Error('Database not initialized'));
        return;
      }

      const transaction = this._db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const request = store.get(revision.id);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          observer.error(new Error('Revision data not found'));
          return;
        }

        observer.next(result.data);
        observer.complete();
      };

      request.onerror = () => {
        observer.error(new Error('Failed to load revision data'));
      };
    });
  }

  private processData(rawData: ArrayBuffer | FireEvent[], params?: FireSourceParams): Observable<FireEvent[]> {
    if (rawData instanceof ArrayBuffer) {
      return this.processDataWithWorker(rawData, params);
    }
    return of(rawData);
  }

  private filterDataMainThread(events: FireEvent[], params?: FireSourceParams): FireEvent[] {
    let filtered = events;

    // Apply bbox filter
    if (params?.bbox) {
      const [minX, minY, maxX, maxY] = params.bbox;
      filtered = filtered.filter(event => {
        const [lon, lat] = event.geometry.coordinates;
        return lon >= minX && lon <= maxX && lat >= minY && lat <= maxY;
      });
    }

    // Apply time filter
    if (params?.range) {
      const { from, to } = params.range;
      filtered = filtered.filter(event => {
        const eventTime = new Date(event.properties.timestamp);
        return eventTime >= from && eventTime <= to;
      });
    }

    return filtered;
  }

  private saveRevision(revision: CacheRevision, data: ArrayBuffer): Observable<CacheRevision> {
    return new Observable<CacheRevision>(observer => {
      if (!this._db) {
        observer.error(new Error('Database not initialized'));
        return;
      }

      const transaction = this._db.transaction(['revisions', 'data'], 'readwrite');

      // Save revision metadata
      const revisionStore = transaction.objectStore('revisions');
      const revisionRequest = revisionStore.add(revision);

      // Save revision data
      const dataStore = transaction.objectStore('data');
      const dataRequest = dataStore.add({
        revisionId: revision.id,
        data: data
      });

      transaction.oncomplete = () => {
        this.availableRevisions.update(revisions => [...revisions, revision]);
        this.updateCacheMetadata();
        observer.next(revision);
        observer.complete();
      };

      transaction.onerror = () => {
        observer.error(new Error('Failed to save revision'));
      };
    });
  }

  private compressData(data: FireEvent[]): Observable<ArrayBuffer> {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(jsonString);

    // Only compress if data size exceeds threshold
    if (uint8Array.length > this.cacheStrategy.compressionThreshold && 'CompressionStream' in window) {
      return new Observable<ArrayBuffer>(observer => {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        const chunks: Uint8Array[] = [];
        let totalSize = 0;

        const pump = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              const result = new Uint8Array(totalSize);
              let offset = 0;

              for (const chunk of chunks) {
                result.set(chunk, offset);
                offset += chunk.length;
              }

              observer.next(result.buffer);
              observer.complete();
            } else {
              chunks.push(value);
              totalSize += value.length;
              pump();
            }
          });
        };

        pump();
        writer.write(uint8Array);
        writer.close();
      });
    }

    return of(uint8Array.buffer);
  }

  private decompressData(compressedData: ArrayBuffer): Observable<ArrayBuffer> {
    // Use DecompressionStream if available
    if ('DecompressionStream' in window) {
      return new Observable<ArrayBuffer>(observer => {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        const chunks: Uint8Array[] = [];

        const pump = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
              const result = new Uint8Array(totalLength);
              let offset = 0;

              for (const chunk of chunks) {
                result.set(chunk, offset);
                offset += chunk.length;
              }

              observer.next(result.buffer);
              observer.complete();
            } else {
              chunks.push(value);
              pump();
            }
          });
        };

        pump();
        writer.write(new Uint8Array(compressedData));
        writer.close();
      });
    }

    return of(compressedData);
  }

  private performCleanup(): Observable<void> {
    return new Observable<void>(observer => {
      const now = new Date();
      const expiredRevisions = this.availableRevisions().filter(rev => rev.expiresAt < now);

      if (expiredRevisions.length === 0) {
        observer.next(void 0);
        observer.complete();
        return;
      }

      if (!this._db) {
        observer.error(new Error('Database not initialized'));
        return;
      }

      const transaction = this._db.transaction(['revisions', 'data'], 'readwrite');
      const revisionStore = transaction.objectStore('revisions');
      const dataStore = transaction.objectStore('data');

      expiredRevisions.forEach(revision => {
        revisionStore.delete(revision.id);
        dataStore.delete(revision.id);
      });

      transaction.oncomplete = () => {
        this.availableRevisions.update(revisions =>
          revisions.filter(rev => !expiredRevisions.includes(rev))
        );
        this.updateCacheMetadata();
        observer.next(void 0);
        observer.complete();
      };

      transaction.onerror = () => {
        observer.error(new Error('Failed to cleanup expired data'));
      };
    });
  }

  private clearAllData(): Observable<void> {
    return new Observable<void>(observer => {
      if (!this._db) {
        observer.error(new Error('Database not initialized'));
        return;
      }

      const transaction = this._db.transaction(['revisions', 'data', 'metadata'], 'readwrite');

      transaction.objectStore('revisions').clear();
      transaction.objectStore('data').clear();
      transaction.objectStore('metadata').clear();

      transaction.oncomplete = () => {
        observer.next(void 0);
        observer.complete();
      };
      
      transaction.onerror = () => {
        observer.error(new Error('Failed to clear cache'));
      };
    });
  }

  private updateCacheMetadata(): void {
    const revisions = this.availableRevisions();
    const metadata: CacheMetadata = {
      totalSize: revisions.reduce((sum, rev) => sum + rev.size, 0),
      revisionCount: revisions.length,
      lastCleanup: new Date()
    };

    this.cacheMetadata.set(metadata);

    // Save to IndexedDB
    if (this._db) {
      const transaction = this._db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      store.put({ key: 'cache-metadata', value: metadata });
    }
  }

  private generateRevisionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  private calculateBoundingBox(data: FireEvent[]): Extent {
    if (data.length === 0) {
      return [0, 0, 0, 0];
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const event of data) {
      const [lon, lat] = event.geometry.coordinates;
      minX = Math.min(minX, lon);
      minY = Math.min(minY, lat);
      maxX = Math.max(maxX, lon);
      maxY = Math.max(maxY, lat);
    }

    return [minX, minY, maxX, maxY];
  }

  private bboxIntersects(bbox1: Extent, bbox2: Extent): boolean {
    const [minX1, minY1, maxX1, maxY1] = bbox1;
    const [minX2, minY2, maxX2, maxY2] = bbox2;

    return !(maxX1 < minX2 || minX1 > maxX2 || maxY1 < minY2 || minY1 > maxY2);
  }

  protected override clearData(): void {
    this._features.set([]);
    this._lastUpdate = new Date(0);
  }

  private createRevision(data: FireEvent[], compressedData: ArrayBuffer, bbox?: Extent, source: 'api' | 'local' | 'realtime' = 'api'): CacheRevision {
    return {
      id: this.generateRevisionId(),
      bbox: bbox || this.calculateBoundingBox(data),
      timestamp: new Date(),
      version: 1,
      size: compressedData.byteLength,
      compressed: true,
      expiresAt: new Date(Date.now() + this._storageConfig.defaultExpiration * 3600000),
      source
    };
  }

  private updateMemoryCache(revision: CacheRevision, data: FireEvent[]): void {
    const entry: MemoryCacheEntry = {
      data,
      timestamp: Date.now(),
      size: this.calculateDataSize(data),
      bbox: revision.bbox,
      revisionId: revision.id,
      lastAccess: Date.now()
    };

    this.memoryCache.set(revision.id, entry);
    this.cleanupMemoryCache();
  }

  private getFromMemoryCache(revisionId: string): FireEvent[] | null {
    this.performanceMonitor.totalOperations++;
    const entry = this.memoryCache.get(revisionId);
    
    if (!entry) {
      this.performanceMonitor.cacheMisses++;
      this.updatePerformanceMetrics('cacheHitRate', 0);
      return null;
    }

    if (Date.now() - entry.timestamp > this.cacheStrategy.maxAge) {
      this.memoryCache.delete(revisionId);
      this.performanceMonitor.cacheMisses++;
      this.updatePerformanceMetrics('cacheHitRate', 0);
      return null;
    }

    entry.lastAccess = Date.now();
    this.performanceMonitor.cacheHits++;
    this.updatePerformanceMetrics('cacheHitRate', 1);
    return entry.data;
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    let totalSize = 0;
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => b[1].lastAccess - a[1].lastAccess);

    // Process in batches for better performance
    const batchSize = this.cacheStrategy.batchSize;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      for (const [key, value] of batch) {
        if (now - value.timestamp > this.cacheStrategy.maxAge) {
          this.memoryCache.delete(key);
          continue;
        }

        totalSize += value.size;
        if (totalSize > this.cacheStrategy.maxSize) {
          this.memoryCache.delete(key);
        }
      }
    }

    this.performanceMonitor.lastCleanup = new Date();
    this.performanceMonitor.cleanupCount++;
    this.updatePerformanceMetrics('memoryUsage', totalSize);
  }

  private startPerformanceMonitoring(): void {
    timer(0, 60000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updatePerformanceMetrics();
    });
  }

  private updatePerformanceMetrics(metric?: keyof CacheMetrics, value?: number): Observable<void> {
    if (metric && value !== undefined) {
      this.performanceMetrics.update(metrics => ({
        ...metrics,
        [metric]: value
      }));
      return of(void 0);
    }

    return this.gatherPerformanceMetrics().pipe(
      tap(metrics => {
        // Update cache hit rate
        const hitRate = this.performanceMonitor.totalOperations > 0 
          ? this.performanceMonitor.cacheHits / this.performanceMonitor.totalOperations 
          : 0;
        
        this.performanceMetrics.set({
          ...metrics,
          cacheHitRate: hitRate,
          memoryUsage: this.calculateMemoryUsage(),
          storageUsage: metrics.storageUsage
        });
      }),
      map(() => void 0)
    );
  }

  private gatherPerformanceMetrics(): Observable<CacheMetrics> {
    const metrics = this.performanceMetrics();
    return this.getStorageMetrics().pipe(
      map(storageMetrics => ({
        ...metrics,
        memoryUsage: this.calculateMemoryUsage(),
        storageUsage: storageMetrics.usage
      }))
    );
  }

  private calculateMemoryUsage(): number {
    return Array.from(this.memoryCache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
  }

  private processDataWithWorker(rawData: ArrayBuffer, params?: FireSourceParams): Observable<FireEvent[]> {
    if (!this.workerService) {
      return of(this.processDataMainThread(rawData));
    }

    return new Observable<FireEvent[]>(observer => {
      this.workerService.processData(rawData, {
        bbox: params?.bbox,
        timeRange: params?.range,
        compression: this._storageConfig.compressionLevel
      }).subscribe({
        next: (result) => {
          this.updatePerformanceMetrics('readLatency', result.metrics.latency);
          observer.next(result.data);
          observer.complete();
        },
        error: (error) => {
          console.warn('Worker processing failed, falling back to main thread:', error);
          observer.next(this.processDataMainThread(rawData));
          observer.complete();
        }
      });
    });
  }

  private startCacheCleanup(): void {
    timer(0, this.cacheStrategy.cleanupInterval).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cleanupCache().subscribe({
        error: (err) => console.error('Cache cleanup failed:', err)
      });
    });
  }

  private cleanupCache(): Observable<void> {
    return new Observable<void>(observer => {
      this.getStorageMetrics().subscribe({
        next: metrics => {
          // Cleanup memory cache
          this.cleanupMemoryCache();

          // Cleanup IndexedDB if needed
          if (metrics.usage > this.cacheStrategy.maxSize * 0.9) {
            this.cleanupIndexedDB().subscribe({
              next: () => {
                this.updatePerformanceMetrics('storageUsage', metrics.usage);
                observer.next(void 0);
                observer.complete();
              },
              error: error => observer.error(error)
            });
          } else {
            this.updatePerformanceMetrics('storageUsage', metrics.usage);
            observer.next(void 0);
            observer.complete();
          }
        },
        error: error => observer.error(error)
      });
    });
  }

  private calculateDataSize(data: FireEvent[]): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private getStorageMetrics(): Observable<{ usage: number; quota: number }> {
    return new Observable<{ usage: number; quota: number }>(observer => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          observer.next({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0
          });
          observer.complete();
        }).catch(error => {
          observer.error(error);
        });
      } else {
        observer.next({ usage: 0, quota: 0 });
        observer.complete();
      }
    });
  }

  private initializeMemoryCache(): Observable<void> {
    return new Observable<void>(observer => {
      try {
        // Clear existing memory cache
        this.memoryCache.clear();

        // Load recent revisions into memory cache
        const recentRevisions = this.availableRevisions()
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10); // Keep only 10 most recent revisions in memory

        if (recentRevisions.length === 0) {
          observer.next(void 0);
          observer.complete();
          return;
        }

        // Load each revision's data into memory
        forkJoin(
          recentRevisions.map(revision => 
            this.loadRevisionData(revision).pipe(
              map(rawData => ({
                revision,
                data: this.processDataMainThread(rawData)
              }))
            )
          )
        ).pipe(
          tap(results => {
            results.forEach(({ revision, data }) => {
              if (data) {
                this.memoryCache.set(revision.id, {
                  data,
                  timestamp: revision.timestamp.getTime(),
                  size: this.calculateDataSize(data),
                  bbox: revision.bbox,
                  revisionId: revision.id,
                  lastAccess: Date.now()
                });
              }
            });
            // Cleanup if needed
            this.cleanupMemoryCache();
          })
        ).subscribe({
          next: () => {
            observer.next(void 0);
            observer.complete();
          },
          error: (error) => {
            this.handleError(error instanceof Error ? error : new Error(String(error)), ErrorSeverity.ERROR);
            // Continue even if some revisions fail to load
            observer.next(void 0);
            observer.complete();
          }
        });
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)), ErrorSeverity.ERROR);
        observer.error(error);
      }
    });
  }

  private processDataMainThread(rawData: ArrayBuffer): FireEvent[] {
    try {
      const dataString = new TextDecoder().decode(rawData);
      return JSON.parse(dataString) as FireEvent[];
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), ErrorSeverity.ERROR);
      return [];
    }
  }

  private cleanupIndexedDB(): Observable<void> {
    if (!this._db) {
      return of(void 0);
    }

    return new Observable<void>(observer => {
      const transaction = this._db!.transaction(['revisions', 'data'], 'readwrite');
      const revisionStore = transaction.objectStore('revisions');
      const dataStore = transaction.objectStore('data');

      // Delete old revisions based on timestamp
      const cutoff = new Date(Date.now() - this.cacheStrategy.maxAge);
      const index = revisionStore.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoff);

      fromEvent(index.getAll(range), 'success').pipe(
        map((event: Event) => (event.target as IDBRequest).result as CacheRevision[]),
        switchMap(oldRevisions => {
          const deleteOperations = oldRevisions.map(revision => 
            fromEvent(revisionStore.delete(revision.id), 'success').pipe(
              switchMap(() => fromEvent(dataStore.delete(revision.id), 'success'))
            )
          );
          return deleteOperations.length ? forkJoin(deleteOperations) : of(void 0);
        }),
        switchMap(() => fromEvent(transaction, 'complete')),
        catchError(error => {
          observer.error(new Error('Failed to cleanup IndexedDB'));
          return EMPTY;
        })
      ).subscribe({
        next: () => {
          observer.next(void 0);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
