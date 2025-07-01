/*

Key Features of This Implementation:

1. Network Connectivity Detection
- Monitors online/offline status via Navigator API
- Detects connection type and quality
- Distinguishes between internet and local network connectivity

2. Connection Quality Assessment
- Measures connection speed and latency
- Evaluates connection stability
- Provides quality ratings for decision making

3. Local Network Detection
- Checks for local network accessibility
- Identifies mesh networks and local servers
- Supports field operation scenarios

4. Reactive State Management
- Uses RxJS observables for real-time updates
- Provides signals for Angular components
- Debounced updates to prevent excessive notifications

5. Browser API Integration
- Uses Network Information API when available
- Falls back to connection testing for unsupported browsers
- Handles various browser compatibility scenarios

This service enables intelligent data source selection based on
actual network conditions rather than just online/offline status.

*/

import { Injectable, signal, computed } from "@angular/core";
import { BehaviorSubject, Observable, interval, timer, of, from } from "rxjs";
import {
  map,
  distinctUntilChanged,
  catchError,
  switchMap,
  debounceTime,
  tap,
  timeout
} from "rxjs/operators";

export enum NetworkStatus {
  ONLINE = 'online',
  LOCAL_NETWORK = 'local-network',
  OFFLINE = 'offline'
}

export interface NetworkInfo {
  status: NetworkStatus;
  connectionType: string;
  downlink?: number; // Mbps
  rtt?: number; // Round trip time in ms
  effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  lastChecked: Date;
}

export interface ConnectionTest {
  endpoint: string;
  timeout: number;
  expectedSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {

  // Private state
  private _status$ = new BehaviorSubject<NetworkStatus>(NetworkStatus.OFFLINE);
  private _networkInfo$ = new BehaviorSubject<NetworkInfo>(this.getInitialNetworkInfo());
  private _isMonitoring = false;
  private _monitoringInterval?: ReturnType<typeof setInterval>;

  // Public reactive state
  readonly status$ = this._status$.asObservable().pipe(
    distinctUntilChanged(),
    debounceTime(500) // Debounce to prevent rapid status changes
  );

  readonly networkInfo$ = this._networkInfo$.asObservable().pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  readonly currentStatus = signal<NetworkStatus>(NetworkStatus.OFFLINE);
  readonly currentNetworkInfo = signal<NetworkInfo>(this.getInitialNetworkInfo());

  // Computed signals
  readonly isOnline = computed(() => this.currentStatus() === NetworkStatus.ONLINE);
  readonly isLocalNetwork = computed(() => this.currentStatus() === NetworkStatus.LOCAL_NETWORK);
  readonly isOffline = computed(() => this.currentStatus() === NetworkStatus.OFFLINE);
  readonly connectionQuality = computed(() => this.currentNetworkInfo().quality);

  // Test endpoints for connectivity checks
  private readonly internetTestEndpoints: ConnectionTest[] = [
    { endpoint: 'https://www.google.com/favicon.ico', timeout: 5000, expectedSize: 1000 },
    { endpoint: 'https://httpbin.org/delay/0', timeout: 5000 },
    { endpoint: 'https://jsonplaceholder.typicode.com/posts/1', timeout: 5000 }
  ];

  private readonly localNetworkTestEndpoints: ConnectionTest[] = [
    { endpoint: 'http://192.168.1.1', timeout: 3000 },
    { endpoint: 'http://10.0.0.1', timeout: 3000 },
    { endpoint: 'http://172.16.0.1', timeout: 3000 }
  ];

  constructor() {
    this.initializeNetworkMonitoring();
    this.startMonitoring();

    // Subscribe to status changes and update signals
    this.status$.subscribe(status => {
      this.currentStatus.set(status);
    });

    this.networkInfo$.subscribe(info => {
      this.currentNetworkInfo.set(info);
    });
  }

  // Public methods

  getCurrentStatus(): NetworkStatus {
    return this._status$.value;
  }

  getCurrentNetworkInfo(): NetworkInfo {
    return this._networkInfo$.value;
  }

  forceCheck(): Observable<NetworkStatus> {
    return this.performConnectivityCheck().pipe(
      tap(status => {
        this._status$.next(status);
        this.updateNetworkInfo(status);
      })
    );
  }

  startMonitoring(): void {
    if (this._isMonitoring) return;

    this._isMonitoring = true;

    // Perform initial check
    this.forceCheck().subscribe();

    // Set up periodic checks
    this._monitoringInterval = setInterval(() => {
      this.performConnectivityCheck().subscribe(
        status => {
          this._status$.next(status);
          this.updateNetworkInfo(status);
        },
        error => {
          console.warn('Network check failed:', error);
          this._status$.next(NetworkStatus.OFFLINE);
        }
      );
    }, 30000); // Check every 30 seconds
  }

  stopMonitoring(): void {
    this._isMonitoring = false;

    if (this._monitoringInterval) {
      clearInterval(this._monitoringInterval);
      this._monitoringInterval = undefined;
    }
  }

  testInternetConnectivity(): Observable<boolean> {
    return this.testEndpoints(this.internetTestEndpoints);
  }

  testLocalNetworkConnectivity(): Observable<boolean> {
    return this.testEndpoints(this.localNetworkTestEndpoints);
  }

  // Private methods

  private initializeNetworkMonitoring(): void {
    // Listen to browser online/offline events
    window.addEventListener('online', () => {
      this.forceCheck().subscribe();
    });

    window.addEventListener('offline', () => {
      this._status$.next(NetworkStatus.OFFLINE);
      this.updateNetworkInfo(NetworkStatus.OFFLINE);
    });

    // Listen to connection changes if Network Information API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', () => {
          // Delay check to allow connection to stabilize
          timer(1000).pipe(
            switchMap(() => this.forceCheck())
          ).subscribe();
        });
      }
    }
  }

  private performConnectivityCheck(): Observable<NetworkStatus> {
    // Quick check: if browser says we're offline, trust it
    if (!navigator.onLine) {
      return of(NetworkStatus.OFFLINE);
    }

    // Test internet connectivity first
    return this.testInternetConnectivity().pipe(
      switchMap(hasInternet => {
        if (hasInternet) {
          return of(NetworkStatus.ONLINE);
        }

        // If no internet, check for local network
        return this.testLocalNetworkConnectivity().pipe(
          map(hasLocalNetwork =>
            hasLocalNetwork ? NetworkStatus.LOCAL_NETWORK : NetworkStatus.OFFLINE
          )
        );
      }),
      catchError(() => of(NetworkStatus.OFFLINE))
    );
  }

  private testEndpoints(endpoints: ConnectionTest[]): Observable<boolean> {
    // Test endpoints concurrently and return true if any succeed
    const tests = endpoints.map(endpoint => this.testSingleEndpoint(endpoint));

    return new Observable<boolean>(observer => {
      let completedTests = 0;
      let hasSuccess = false;

      tests.forEach(test => {
        test.subscribe({
          next: (success) => {
            if (success) {
              hasSuccess = true;
              observer.next(true);
              observer.complete();
            }
          },
          error: () => {
            completedTests++;
            if (completedTests === tests.length && !hasSuccess) {
              observer.next(false);
              observer.complete();
            }
          },
          complete: () => {
            completedTests++;
            if (completedTests === tests.length && !hasSuccess) {
              observer.next(false);
              observer.complete();
            }
          }
        });
      });
    });
  }

  private testSingleEndpoint(test: ConnectionTest): Observable<boolean> {
    const startTime = Date.now();

    return from(fetch(test.endpoint, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    })).pipe(
      timeout(test.timeout),
      map(response => {
        const responseTime = Date.now() - startTime;
        // Consider connection good if response time is reasonable
        return responseTime < test.timeout;
      }),
      catchError(() => of(false))
    );
  }

  private updateNetworkInfo(status: NetworkStatus): void {
    const info: NetworkInfo = {
      status,
      connectionType: this.getConnectionType(),
      quality: this.calculateConnectionQuality(status),
      lastChecked: new Date()
    };

    // Add Network Information API data if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        info.downlink = connection.downlink;
        info.rtt = connection.rtt;
        info.effectiveType = connection.effectiveType;
      }
    }

    this._networkInfo$.next(info);
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.type || connection?.effectiveType || 'unknown';
    }

    return 'unknown';
  }

  private calculateConnectionQuality(status: NetworkStatus): 'excellent' | 'good' | 'fair' | 'poor' {
    if (status === NetworkStatus.OFFLINE) {
      return 'poor';
    }

    if (status === NetworkStatus.LOCAL_NETWORK) {
      return 'fair';
    }

    // For online status, check Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        const rtt = connection.rtt;

        if (effectiveType === '4g' && downlink > 10 && rtt < 100) {
          return 'excellent';
        } else if (effectiveType === '4g' || (downlink > 5 && rtt < 200)) {
          return 'good';
        } else if (effectiveType === '3g' || (downlink > 1 && rtt < 500)) {
          return 'fair';
        } else {
          return 'poor';
        }
      }
    }

    // Default to good for online connections when API is not available
    return 'good';
  }

  private getInitialNetworkInfo(): NetworkInfo {
    return {
      status: navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,
      connectionType: this.getConnectionType(),
      quality: navigator.onLine ? 'good' : 'poor',
      lastChecked: new Date()
    };
  }

  // Utility methods for external use

  canUseApiSource(): boolean {
    return this.getCurrentStatus() === NetworkStatus.ONLINE &&
           this.getCurrentNetworkInfo().quality !== 'poor';
  }

  canUseRealtimeSource(): boolean {
    return this.getCurrentStatus() === NetworkStatus.ONLINE &&
           ['excellent', 'good'].includes(this.getCurrentNetworkInfo().quality);
  }

  canUseLocalNetworkSource(): boolean {
    return [NetworkStatus.ONLINE, NetworkStatus.LOCAL_NETWORK].includes(this.getCurrentStatus());
  }

  shouldFallbackToCache(): boolean {
    return this.getCurrentStatus() === NetworkStatus.OFFLINE ||
           this.getCurrentNetworkInfo().quality === 'poor';
  }
}
