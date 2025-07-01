/*

Key Features of This Implementation:


This manager provides a single point of access for fire data while
intelligently managing multiple data sources behind the scenes.

1. Data Source Management:
- Coordinates between multiple data sources (API, Realtime, Local Network, Cache)
- Handles source selection and fallback
- Manages source health monitoring
- Provides data caching

2. Data Flow:
- Exposes events signal for current fire events
- Provides dataUpdate$ observable for real-time updates
- Handles data refresh and error recovery
- Manages data caching strategy

3. Source Coordination:
- Network-aware source selection
- Automatic fallback when sources fail
- Health monitoring of all sources
- Source capability management

4. State Management:
- Tracks loading state
- Manages error state
- Monitors source health
- Tracks connection status

*/

import { Injectable, inject, signal, computed, OnDestroy, effect } from "@angular/core";
import { Observable, Subject, of, combineLatest, timer, from, firstValueFrom, BehaviorSubject, throwError } from "rxjs";
import {
  catchError,
  finalize,
  map,
  switchMap,
  tap,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  retry,
  shareReplay,
  filter,
  take
} from "rxjs/operators";

import { FireSourceApiService } from "./fire-source-api.service";
import { FireSourceRealtimeService } from "./fire-source-realtime.service";
import { FireSourceLocalService } from "./fire-source-local.service";
import { FireManifestService } from "./fire-source-manifest.service";
import { FireSourceWorkerService } from "./fire-source-worker.service";

import { NetworkStatus, NetworkStatusService } from "../../../core/network-status.service";
import { 
  DataSourceType, 
  ErrorSeverity, 
  FireSourceError, 
  FireSourceParams,
  FireEvent,
  FireSourceState,
  FireSourceResult,
  SourceStats,
  ManagerConfig,
  FireSourceManagerState,
  SourceHealth
} from "../models";
import { FireSourceBaseService } from "./fire-source-base.service";

@Injectable({
  providedIn: 'root'
})
export class FireSourceManager implements OnDestroy {
  // Dependencies
  private apiService = inject(FireSourceApiService);
  private realtimeService = inject(FireSourceRealtimeService);
  private localService = inject(FireSourceLocalService);
  private manifestService = inject(FireManifestService);
  private workerService = inject(FireSourceWorkerService);
  private networkService = inject(NetworkStatusService);

  // Private state
  private _destroy$ = new Subject<void>();
  private _activeSource: FireSourceBaseService | null = null;
  private _sources: Record<DataSourceType, FireSourceBaseService>;
  private _healthCheckTimer?: ReturnType<typeof setInterval>;
  private _config: ManagerConfig;
  private _lastSuccessfulParams?: FireSourceParams;
  private _state$ = new BehaviorSubject<FireSourceManagerState>({
    events: [],
    loading: false,
    error: null,
    activeSource: null,
    sourceHealth: [],
    stats: { totalEvents: 0, lastUpdate: new Date() }
  });

  // Public reactive state
  readonly state$ = this._state$.asObservable().pipe(shareReplay(1));
  readonly events$ = this.state$.pipe(map(state => state.events));
  readonly loading$ = this.state$.pipe(map(state => state.loading));
  readonly error$ = this.state$.pipe(map(state => state.error));
  readonly activeSource$ = this.state$.pipe(map(state => state.activeSource));
  readonly sourceHealth$ = this.state$.pipe(map(state => state.sourceHealth));
  readonly stats$ = this.state$.pipe(map(state => state.stats));

  // Public signals for direct access
  readonly events = signal<readonly FireEvent[]>([]);
  readonly loading = signal(false);
  readonly error = signal<FireSourceError | null>(null);
  readonly activeSourceType = signal<DataSourceType | null>(null);
  readonly sourcesInitialized = signal(false);
  readonly sourceHealth = signal<SourceHealth[]>([]);

  constructor() {
    this._config = this.loadConfig();
    this._sources = {
      [DataSourceType.API]: this.apiService,
      [DataSourceType.REALTIME]: this.realtimeService,
      [DataSourceType.LOCAL_NETWORK]: this.localService,
      [DataSourceType.CACHE]: this.manifestService
    };
  }

  private initializeManager(): Observable<void> {
    console.log('FireSourceManager: Initializing manager');
    return this.initializeAllSources().pipe(
      tap(() => {
        console.log('FireSourceManager: Sources initialized, selecting optimal source');
        this.sourcesInitialized.set(true);
        this.selectOptimalSource();
        //this.setupReactiveSubscriptions();
        //this.startHealthMonitoring();
      }),
      catchError(error => {
        console.error('FireSourceManager: Failed to initialize:', error);
        this._activeSource = this.manifestService;
        this.activeSourceType.set(DataSourceType.CACHE);
        return of(void 0);
      })
    );
  }

  // Public API Methods

  getEvents(
    bbox: [number, number, number, number],
    from: Date,
    to: Date
  ): Observable<readonly FireEvent[]> {
    return this.refresh({ bbox, range: { from, to } }).pipe(
      tap(events => {
        this.events.set(events);
        this.updateState({ events, loading: false });
      }),
      catchError(err => this.handleRefreshError(err, { bbox, range: { from, to } })),
      finalize(() => this.updateState({ loading: false }))
    );
  }

  getEventById(id: string): Observable<FireEvent | null> {
    return this.refresh().pipe(
      map(events => events.find(e => e.id === id) || null),
      catchError(err => {
        console.error('Error getting event by ID:', err);
        return of(null);
      })
    );
  }

  getEventsByRegion(region: string): Observable<readonly FireEvent[]> {
    return this.refresh().pipe(
      map(events => events.filter(e => e.properties['region'] === region)),
      catchError(err => {
        console.error('Error getting events by region:', err);
        return of([]);
      })
    );
  }

  getEventsByTimeRange(from: Date, to: Date): Observable<readonly FireEvent[]> {
    return this.refresh({ range: { from, to } }).pipe(
      tap(events => {
        this.events.set(events);
        this.updateState({ events, loading: false });
      }),
      catchError(err => this.handleRefreshError(err, { range: { from, to } })),
      finalize(() => this.updateState({ loading: false }))
    );
  }

  getEventsByBbox(bbox: [number, number, number, number]): Observable<readonly FireEvent[]> {
    return this.refresh({ bbox }).pipe(
      tap(events => {
        this.events.set(events);
        this.updateState({ events, loading: false });
      }),
      catchError(err => this.handleRefreshError(err, { bbox })),
      finalize(() => this.updateState({ loading: false }))
    );
  }

  refresh(params?: FireSourceParams): Observable<readonly FireEvent[]> {
    console.log('FireSourceManager: Refreshing data with params:', params);
    this._state$.next({ ...this._state$.value, loading: true });

    return this.initializeAndRefresh(params).pipe(
      tap(events => {
        console.log('FireSourceManager: Received', events.length, 'events');
        this._state$.next({
          ...this._state$.value,
          events,
          loading: false,
          error: null
        });
      }),
      catchError(error => {
        console.error('FireSourceManager: Error refreshing data:', error);
        return this.handleRefreshError(error, params);
      })
    );
  }

  switchToSource(sourceType: DataSourceType): Observable<boolean> {
    const source = this._sources[sourceType];
    if (!source) {
      return of(false);
    }

    return this.switchActiveSource(source, sourceType).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  enableRealtime(endpoint?: string): Observable<void> {
    const realtimeEndpoint = endpoint || '/hubs/fire';

    return this.realtimeService.enableRealtime(realtimeEndpoint).pipe(
      tap(() => {
        this._config.realtimeEnabled = true;
        if (this._config.preferredSource === 'auto') {
          this.selectOptimalSource();
        }
      }),
      catchError(err => {
        console.error('Failed to enable realtime:', err);
        return of(void 0);
      })
    );
  }

  disableRealtime(): void {
    this.realtimeService.disableRealtime();
    this._config.realtimeEnabled = false;

    if (this.activeSourceType() === DataSourceType.REALTIME) {
      this.selectOptimalSource();
    }
  }

  getAvailableSources(): DataSourceType[] {
    return Object.entries(this._sources)
      .filter(([_, source]) => this.isSourceHealthy(source))
      .map(([type, _]) => type as DataSourceType);
  }

  clearCache(): Observable<void> {
    return this.manifestService.clearCache();
  }

  getSourceCapabilities(sourceType: DataSourceType) {
    return this._sources[sourceType]?.sourceCapabilities;
  }

  // Private helper methods

  private loadConfig(): ManagerConfig {
    return {
      preferredSource: 'auto',
      enableAutoFallback: true,
      cacheStrategy: 'conservative',
      realtimeEnabled: false,
      healthCheckInterval: 30000
    };
  }

  private initializeAllSources(): Observable<void> {
    console.log('FireSourceManager: Starting source initialization');
    
      return this.apiService.init().pipe(
        tap(() => console.log('FireSourceManager: API service initialized')),
        catchError(error => {
          console.error('FireSourceManager: API service initialization failed:', error);
          return throwError(() => error);
        })
      );
      // this.realtimeService.init().pipe(
      //   tap(() => console.log('FireSourceManager: Realtime service initialized')),
      //   catchError(error => {
      //     console.error('FireSourceManager: Realtime service initialization failed:', error);
      //     return throwError(() => error);
      //   })
      // ),
      // this.localService.init().pipe(
      //   tap(() => console.log('FireSourceManager: Local service initialized')),
      //   catchError(error => {
      //     console.error('FireSourceManager: Local service initialization failed:', error);
      //     return throwError(() => error);
      //   })
      // ),
      // this.manifestService.init().pipe(
      //   tap(() => console.log('FireSourceManager: Manifest service initialized')),
      //   catchError(error => {
      //     console.error('FireSourceManager: Manifest service initialization failed:', error);
      //     return throwError(() => error);
      //   })
      // )
    // ]).pipe(
    //   map(() => void 0),
    //   catchError(error => {
    //     console.error('FireSourceManager: Error during initialization setup:', error);
    //     return throwError(() => error);
    //   })
    // );
  }

  private setupReactiveSubscriptions(): void {
    // Network status changes
    this.networkService.status$.pipe(
      takeUntil(this._destroy$),
      distinctUntilChanged(),
      debounceTime(1000)
    ).subscribe(status => {
      if (this._config.preferredSource === 'auto') {
        this.selectOptimalSource();
      }
    });

    // Source state changes
    effect(() => {
      if (!this._activeSource) return;
      this.updateState({
        loading: this._activeSource.loading(),
        error: this._activeSource.error()
      });
    });
  }

  private selectOptimalSource(): void {
    console.log('FireSourceManager: Selecting optimal source');
    // const networkStatus = this.networkService.getCurrentStatus();
  // const sourceType = this.determineOptimalSource(networkStatus);
    // console.log('FireSourceManager: Selected source type:', sourceType);
    
    // const source = this._sources[sourceType];
    // if (source) {
    //   this.setActiveSource(source, sourceType);
    // }

   
    // Set API service as the default active source
    this.setActiveSource(this.apiService, DataSourceType.API);
  }

  private determineOptimalSource(networkStatus: NetworkStatus): DataSourceType {
    const availableSources = this.getAvailableSources();

    switch (networkStatus) {
      case NetworkStatus.ONLINE:
        if (this._config.realtimeEnabled && availableSources.includes(DataSourceType.REALTIME)) {
          return DataSourceType.REALTIME;
        }
        if (availableSources.includes(DataSourceType.API)) {
          return DataSourceType.API;
        }
        break;

      case NetworkStatus.LOCAL_NETWORK:
        if (availableSources.includes(DataSourceType.LOCAL_NETWORK)) {
          return DataSourceType.LOCAL_NETWORK;
        }
        break;

      case NetworkStatus.OFFLINE:
        return DataSourceType.CACHE;
    }

    return DataSourceType.CACHE;
  }

  private setActiveSource(source: FireSourceBaseService, sourceType: DataSourceType): void {
    if (this._activeSource === source) return;

    this._activeSource = source;
    this.activeSourceType.set(sourceType);
    this.updateState({ activeSource: sourceType });

    console.log(`Switched to fire data source: ${sourceType}`);
  }

  private switchActiveSource(source: FireSourceBaseService, sourceType: DataSourceType): Observable<void> {
    this.setActiveSource(source, sourceType);

    if (this._lastSuccessfulParams) {
      return this.refresh(this._lastSuccessfulParams).pipe(map(() => void 0));
    }

    return of(void 0);
  }

  private isSourceHealthy(source: FireSourceBaseService): boolean {
    const error = source.error();
    return !error || error.severity !== ErrorSeverity.CRITICAL;
  }

  private initializeAndRefresh(params?: FireSourceParams): Observable<readonly FireEvent[]> {
    console.log('FireSourceManager: Initializing and refreshing with params:', params);
    if (!this._activeSource) {
      console.log('FireSourceManager: No active source, initializing...');
      return this.initializeManager().pipe(
        switchMap(() => {
          console.log('FireSourceManager: Manager initialized, refreshing data');
          return this._activeSource?.refresh(params) || of([]);
        })
      );
    }
    console.log('FireSourceManager: Using existing active source');
    return this._activeSource.refresh(params);
  }

  private handleRefreshError(error: any, params?: FireSourceParams): Observable<readonly FireEvent[]> {
    console.error('FireSourceManager: Refresh error:', error);
    this._state$.next({
      ...this._state$.value,
      loading: false,
      error
    });

    return this.tryFallbackSources(params);
  }

  private tryFallbackSources(params?: FireSourceParams): Observable<readonly FireEvent[]> {
    console.log('FireSourceManager: Trying fallback sources');
    const fallbackOrder = [
      DataSourceType.API,
      DataSourceType.REALTIME,
      DataSourceType.LOCAL_NETWORK,
      DataSourceType.CACHE
    ];

    return from(fallbackOrder).pipe(
      switchMap(sourceType => {
        const source = this._sources[sourceType];
        if (source && source !== this._activeSource) {
          console.log('FireSourceManager: Trying fallback source:', sourceType);
          return source.refresh(params).pipe(
            tap(events => {
              if (events.length > 0) {
                console.log('FireSourceManager: Successfully retrieved data from fallback:', sourceType);
                this.setActiveSource(source, sourceType);
              }
            })
          );
        }
        return of([]);
      }),
      filter(events => events.length > 0),
      take(1),
      catchError(() => of([]))
    );
  }

  private cacheCurrentData(params?: FireSourceParams): void {
    if (!this._activeSource || this.activeSourceType() === DataSourceType.CACHE) {
      return;
    }

    const events = this._activeSource.features();
    if (events.length > 0) {
      this.manifestService.storeData(
        events as FireEvent[],
        params?.bbox,
        this.activeSourceType() as 'api' | 'local' | 'realtime'
      ).subscribe({
        next: () => console.log('Data cached successfully'),
        error: (err) => console.warn('Caching failed:', err)
      });
    }
  }

  private startHealthMonitoring(): void {
    this._healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this._config.healthCheckInterval);
  }

  private performHealthChecks(): void {
    combineLatest(
      Object.entries(this._sources).map(([type, source]) =>
        this.checkSourceHealth(source, type as DataSourceType)
      )
    ).subscribe(healthResults => {
      this.sourceHealth.set(healthResults);
      this.updateState({ sourceHealth: healthResults });

      if (this._activeSource && !this.isSourceHealthy(this._activeSource)) {
        console.warn('Active source is unhealthy, selecting new source');
        this.selectOptimalSource();
      }
    });
  }

  private checkSourceHealth(source: FireSourceBaseService, sourceType: DataSourceType): Observable<SourceHealth> {
    const startTime = Date.now();

    return (source.healthCheck?.() || of(true)).pipe(
      map(healthy => ({
        sourceType,
        healthy: !!healthy,
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorCount: source.connectionStatus().errorCount || 0
      })),
      catchError(() => of({
        sourceType,
        healthy: false,
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorCount: (source.connectionStatus().errorCount || 0) + 1
      }))
    );
  }

  private updateState(partial: Partial<FireSourceManagerState>): void {
    this._state$.next({
      ...this._state$.value,
      ...partial
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();

    if (this._healthCheckTimer) {
      clearInterval(this._healthCheckTimer);
    }

    Object.values(this._sources).forEach(source => {
      source.destroy();
    });
  }
}
