/**
 * FireSourceRealtimeService
 * 
 * A real-time fire event monitoring service that provides live updates of fire events using SignalR.
 * This service extends FireSourceBaseService to provide real-time capabilities for fire event tracking.
 * 
 * Key Features:
 * 1. SignalR Integration
 *    - Uses @microsoft/signalr for real-time communication
 *    - Automatic reconnection with exponential backoff
 *    - Configurable transport options (WebSockets, ServerSentEvents)
 *    - Connection state monitoring and management
 *    - Hub connection lifecycle handling
 * 
 * 2. Real-time Event Processing
 *    - Handles individual fire events and batch updates
 *    - Supports multiple event types:
 *      * Fire detection events
 *      * Fire update events
 *      * Fire resolution events
 *    - Worker service integration for performance optimization
 *    - Main thread fallback processing
 * 
 * 3. Group-based Subscriptions
 *    - Geographic group management based on bounding box
 *    - Automatic group rejoining after reconnection
 *    - Global fire monitoring support
 *    - Dynamic group membership
 * 
 * 4. Connection Management
 *    - Robust connection state tracking
 *    - Automatic reconnection with configurable retry policy
 *    - Connection health monitoring
 *    - Error handling and recovery
 *    - Connection status updates
 * 
 * 5. Geographic Filtering
 *    - Bounding box-based event filtering
 *    - Spatial awareness for subscriptions
 *    - Efficient real-time data processing
 *    - Dynamic boundary updates
 * 
 * 6. Performance Optimizations
 *    - Angular signals for reactive updates
 *    - Web Worker integration for CPU-intensive operations
 *    - Efficient feature update algorithms
 *    - Batch processing capabilities
 *    - Memory usage optimization
 * 
 * 7. Error Recovery
 *    - Graceful connection failure handling
 *    - Configurable reconnection strategy
 *    - Error severity classification
 *    - Error message extraction and formatting
 *    - Recovery state management
 * 
 * 8. State Management
 *    - Reactive state updates using signals
 *    - Connection state tracking
 *    - Feature data management
 *    - Error state handling
 *    - Loading state management
 * 
 * Usage:
 * ```typescript
 * // Initialize the service
 * const realtimeService = inject(FireSourceRealtimeService);
 * 
 * // Enable real-time updates
 * realtimeService.enableRealtime('/hubs/fire').subscribe({
 *   next: () => console.log('Realtime enabled'),
 *   error: (err) => console.error('Failed to enable realtime:', err)
 * });
 * 
 * // Subscribe to real-time events
 * realtimeService.features.subscribe(events => {
 *   console.log('New fire events:', events);
 * });
 * 
 * // Monitor connection status
 * realtimeService.connectionStatus.subscribe(status => {
 *   console.log('Connection status:', status);
 * });
 * 
 * // Cleanup
 * realtimeService.destroy();
 * ```
 * 
 * Configuration:
 * - Default reconnection attempts: 5
 * - Exponential backoff strategy
 * - Configurable transport options
 * - Customizable error thresholds
 * 
 * Error Handling:
 * - Three severity levels: WARNING, ERROR, CRITICAL
 * - Automatic error recovery for non-critical errors
 * - Detailed error reporting
 * - Connection error specific handling
 * 
 * Performance Considerations:
 * - Uses Web Workers for CPU-intensive operations
 * - Implements efficient update algorithms
 * - Optimizes memory usage
 * - Handles batch updates efficiently
 * 
 * Note: This service is designed for high-performance real-time fire event monitoring
 * with robust error handling and recovery mechanisms. It uses SignalR for real-time
 * communication and implements various optimizations for efficient data processing.
 */

import { Injectable, inject, signal, computed, OnDestroy } from "@angular/core";
import { Observable, Subject, of, throwError, timer, BehaviorSubject } from "rxjs";
import {
  catchError,
  finalize,
  map,
  switchMap,
  tap,
  takeUntil,
  retry,
  delay
} from "rxjs/operators";
import {
  DataSourceType,
  DataSourceCapabilities,
  FireSourceParams,
  FireSourceStats,
  FireSourceError,
  ErrorSeverity,
  ConnectionStatus,
  FireEvent,
  SourceStats,
  FireSourceState
} from "../models";
import { RealtimeFireEvent, RealtimeBatch } from "../models";
import { FireSourceWorkerService } from "./fire-source-worker.service";
import { environment } from "src/environments/environment";
import * as signalR from "@microsoft/signalr";
import { FireSourceBaseService } from "./fire-source-base.service";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

@Injectable({
  providedIn: 'root'
})
export class FireSourceRealtimeService extends FireSourceBaseService implements OnDestroy {

   //#region Dependencies and State

  private workerService = inject(FireSourceWorkerService);
  private readonly destroy$ = new Subject<void>();

  // Source configuration
  override readonly sourceType = DataSourceType.REALTIME;
  override readonly sourceCapabilities: DataSourceCapabilities = {
    supportsRealtime: true,
    supportsLocalNetwork: false,
    supportsCaching: false,
    supportsFiltering: true,
    supportsBoundingBox: true,
    maxConcurrentRequests: 1,
    updateInterval: 1000
  };

  // Private state
  private _connection: signalR.HubConnection | null = null;
  private _lastUpdate: Date = new Date(0);
  private _hubUrl: string;
  private _reconnectAttempts = 0;
  private _maxReconnectAttempts = 5;
  private _currentBbox?: [number, number, number, number];
  private _isRealtimeEnabled = signal(false);
  private _connectionState = new BehaviorSubject<signalR.HubConnectionState>(signalR.HubConnectionState.Disconnected);
  private hubConnection?: HubConnection;
  private _realtimeEvents$ = new Subject<FireEvent>();

  constructor() {
    super();
    this._hubUrl = '/hubs/fire';

    // Monitor connection state changes
    this._connectionState.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.updateConnectionStatus({
        connected: state === signalR.HubConnectionState.Connected,
        endpoint: this._hubUrl,
        lastConnected: new Date(),
        errorCount: 0
      });
    });
  }

  override init(): Observable<void> {
    return of(void 0);
  }

  override refresh(params?: FireSourceParams): Observable<readonly FireEvent[]> {
    this._loading.set(true);
    this.clearError();

    if (!this.hubConnection) {
      return throwError(() => new Error('Realtime connection not initialized'));
    }

    return new Observable<readonly FireEvent[]>(observer => {
      this.hubConnection!.invoke<FireEvent[]>('GetCurrentEvents', params)
        .then(events => {
          this._features.set(events);
          this.updateConnectionStatus({ 
            connected: true,
            lastConnected: new Date(),
            errorCount: 0
          });
          observer.next(events);
          observer.complete();
        })
        .catch(error => {
          this.handleError(error, ErrorSeverity.ERROR);
          observer.error(error);
        })
        .finally(() => {
          this._loading.set(false);
        });
    });
  }

  override destroy(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  override healthCheck(): Observable<boolean> {
    if (!this.hubConnection) {
      return of(false);
    }

    return of(this.hubConnection.state === 'Connected');
  }

  override sourceStats(): SourceStats {
    return {
      totalEvents: this._features().length,
      lastUpdate: new Date()
    };
  }

  enableRealtime(endpoint: string): Observable<void> {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(endpoint)
      .withAutomaticReconnect()
      .build();

    return new Observable<void>(observer => {
      this.hubConnection!.start()
        .then(() => {
          this.setupRealtimeHandlers();
          this.updateConnectionStatus({
            connected: true,
            endpoint,
            lastConnected: new Date(),
            errorCount: 0
          });
          observer.next();
          observer.complete();
        })
        .catch(error => {
          this.handleError(error, ErrorSeverity.ERROR);
          observer.error(error);
        });
    });
  }

  disableRealtime(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
    this.updateConnectionStatus({
      connected: false,
      errorCount: 0
    });
  }

  private setupRealtimeHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('FireEventReceived', (event: FireEvent) => {
      this._realtimeEvents$.next(event);
      this._features.update(events => [...events, event]);
    });

    this.hubConnection.onclose(error => {
      this.handleError(error || new Error('Connection closed'), ErrorSeverity.WARNING);
      this.updateConnectionStatus({
        connected: false,
        errorCount: this._connectionStatus().errorCount + 1
      });
    });
  }

  private setupConnection(): Observable<void> {
    if (this._connection) {
      this._connection.stop();
    }

    // Build SignalR connection
    this._connection = new signalR.HubConnectionBuilder()
      .withUrl(this._hubUrl, {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
        skipNegotiation: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.previousRetryCount < 3) {
            return 1000 * Math.pow(2, retryContext.previousRetryCount);
          }
          return 30000; // 30 seconds for further attempts
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Setup event handlers
    this.setupEventHandlers();

    // Start connection
    this._loading.set(true);

    return new Observable<void>(observer => {
      this._connection!.start()
        .then(() => {
          this._reconnectAttempts = 0;
          this._connectionState.next(this._connection!.state);
          observer.next(void 0);
          observer.complete();
        })
        .catch(err => {
          this.handleConnectionError(err);
          observer.error(err);
        })
        .finally(() => {
          this._loading.set(false);
        });
    });
  }

  private setupEventHandlers(): void {
    if (!this._connection) return;

    // Handle individual fire events
    this._connection.on('FireDetected', (data: RealtimeFireEvent) => {
      this.processRealtimeEvent(data);
    });

    // Handle batch updates
    this._connection.on('FireBatch', (data: RealtimeBatch) => {
      this.processBatchEvents(data);
    });

    // Handle connection lifecycle events
    this._connection.onreconnecting(() => {
      this._loading.set(true);
      this._connectionState.next(signalR.HubConnectionState.Reconnecting);
    });

    this._connection.onreconnected(() => {
      this._loading.set(false);
      this._connectionState.next(signalR.HubConnectionState.Connected);
      this.rejoinGroups();
    });

    this._connection.onclose((error) => {
      this._connectionState.next(signalR.HubConnectionState.Disconnected);
      if (error) {
        this.handleConnectionError(error);
      }
    });
  }

  private processRealtimeEvent(data: RealtimeFireEvent): void {
    if (this.workerService) {
      // Use worker for processing if available
      this.workerService.parseDelta(JSON.stringify(data))
        .pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (processedEvent) => {
            if (processedEvent) {
              this.addOrUpdateFeature(processedEvent, data.type);
            }
          },
          error: (err) => {
            console.warn('Worker processing failed, using main thread:', err);
            this.processEventMainThread(data);
          }
        });
    } else {
      this.processEventMainThread(data);
    }
  }

  private processEventMainThread(data: RealtimeFireEvent): void {
    const event = this.parseFireEvent(data.event);
    if (event && this.isEventInBounds(event)) {
      this.addOrUpdateFeature(event, data.type);
    }
  }

  private processBatchEvents(batch: RealtimeBatch): void {
    batch.events.forEach(event => this.processRealtimeEvent(event));
  }

  private addOrUpdateFeature(event: FireEvent, eventType: string): void {
    this._features.update((currentFeatures: readonly FireEvent[]) => {
      const existingIndex = currentFeatures.findIndex((f: FireEvent) => f.id === event.id);

      switch (eventType) {
        case 'fire_detected':
          // Add new event if it doesn't exist
          if (existingIndex === -1) {
            return [...currentFeatures, event];
          }
          return currentFeatures;

        case 'fire_updated':
          // Update existing event
          if (existingIndex >= 0) {
            const updated = [...currentFeatures];
            updated[existingIndex] = event;
            return updated;
          }
          // Add if doesn't exist
          return [...currentFeatures, event];

        case 'fire_resolved':
          // Remove resolved fire
          if (existingIndex >= 0) {
            return currentFeatures.filter((f: FireEvent) => f.id !== event.id);
          }
          return currentFeatures;

        default:
          return currentFeatures;
      }
    });

    this._lastUpdate = new Date();
  }

  private parseFireEvent(rawEvent: any): FireEvent | null {
    try {
      return {
        id: rawEvent.id,
        type: 'Feature',
        township: rawEvent.township || '',
        geometry: rawEvent.geometry,
        properties: {
          ...rawEvent.properties,
          timestamp: new Date(rawEvent.properties.timestamp)
        },
        source: DataSourceType.REALTIME
      };
    } catch (err) {
      console.error('Error parsing fire event:', err);
      return null;
    }
  }

  private isEventInBounds(event: FireEvent): boolean {
    if (!this._currentBbox) return true;

    const [minX, minY, maxX, maxY] = this._currentBbox;
    const [lon, lat] = event.geometry.coordinates;

    return lon >= minX && lon <= maxX && lat >= minY && lat <= maxY;
  }

  private joinFireGroup(): Observable<void> {
    if (!this._connection || this._connection.state !== signalR.HubConnectionState.Connected) {
      return throwError(() => new Error('Connection not established'));
    }

    return new Observable<void>(observer => {
      const groupName = this._currentBbox
        ? `fire-region-${this._currentBbox.join('-')}`
        : 'fire-global';

      this._connection!.invoke('JoinGroup', groupName)
        .then(() => {
          console.log(`Joined SignalR group: ${groupName}`);
          observer.next(void 0);
          observer.complete();
        })
        .catch(err => {
          console.error('Error joining group:', err);
          observer.error(err);
        });
    });
  }

  private requestCurrentData(params?: FireSourceParams): Observable<void> {
    if (!this._connection || this._connection.state !== signalR.HubConnectionState.Connected) {
      return of(void 0);
    }

    return new Observable<void>(observer => {
      this._connection!.invoke('GetCurrentFireData', params?.bbox)
        .then((currentData: FireEvent[]) => {
          if (currentData && currentData.length > 0) {
            this._features.set(currentData.map(event => this.parseFireEvent(event)).filter(Boolean) as FireEvent[]);
            this._lastUpdate = new Date();
          }
          observer.next(void 0);
          observer.complete();
        })
        .catch(err => {
          console.error('Error requesting current data:', err);
          observer.error(err);
        });
    });
  }

  private rejoinGroups(): void {
    if (this._currentBbox) {
      this.joinFireGroup().subscribe({
        error: (err) => console.error('Error rejoining groups:', err)
      });
    }
  }

  private reconnect(): Observable<void> {
    this._connection?.stop();
    return timer(1000).pipe(
      switchMap(() => this.setupConnection())
    );
  }

  protected override updateConnectionStatus(status: Partial<ConnectionStatus>): void {
    this._connectionStatus.update(currentStatus => ({
      ...currentStatus,
      ...status
    }));
  }

  private handleConnectionError(error: any): void {
    this._reconnectAttempts++;

    const severity = this._reconnectAttempts >= this._maxReconnectAttempts
      ? ErrorSeverity.CRITICAL
      : ErrorSeverity.WARNING;

    this.handleError(error, severity);
  }

  protected override clearData(): void {
    this._features.set([]);
    this._lastUpdate = new Date(0);
  }

  protected override handleError(error: any, severity: ErrorSeverity): void {
    const message = this.extractErrorMessage(error);

    const fireError: FireSourceError = {
      message,
      severity,
      timestamp: new Date(),
      recoverable: severity !== ErrorSeverity.CRITICAL
    };

    this._error.set(fireError);
    console.error(`FireSourceRealtimeService Error:`, error);
  }

  private determineErrorSeverity(error: any): ErrorSeverity {
    if (error.name === 'HttpError' || error.name === 'TimeoutError') {
      return ErrorSeverity.WARNING;
    }

    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      return ErrorSeverity.CRITICAL;
    }

    return ErrorSeverity.ERROR;
  }

  private extractErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown SignalR connection error';
  }
}
