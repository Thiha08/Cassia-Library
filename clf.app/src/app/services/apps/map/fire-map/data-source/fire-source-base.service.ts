/**
 * FireSourceBaseService
 * 
 * Abstract base service that provides core functionality for all fire source data services.
 * This service implements the common patterns and state management for fire data sources.
 * 
 * Key Features:
 * 1. State Management
 *    - Loading state tracking
 *    - Error handling and management
 *    - Feature data storage
 *    - Connection status monitoring
 * 
 * 2. Core Functionality
 *    - Source type identification
 *    - Capability reporting
 *    - Health checking
 *    - Source statistics
 *    - Connection status management
 * 
 * 3. Error Handling
 *    - Severity-based error management
 *    - Recoverable error tracking
 *    - Error clearing
 *    - Error state persistence
 * 
 * 4. Connection Management
 *    - Connection status tracking
 *    - Error count monitoring
 *    - Status updates
 *    - Connection state persistence
 * 
 * 5. Data Management
 *    - Feature data storage
 *    - Data clearing capabilities
 *    - Data refresh functionality
 *    - Source statistics tracking
 * 
 * Abstract Methods to Implement:
 * - init(): Initialize the data source
 * - refresh(): Refresh the data with optional parameters
 * - destroy(): Clean up resources
 * - healthCheck(): Check source health
 * - sourceStats(): Get source statistics
 * 
 * Usage:
 * ```typescript
 * @Injectable()
 * class CustomFireSource extends FireSourceBaseService {
 *   readonly sourceType = DataSourceType.CUSTOM;
 *   readonly sourceCapabilities = {
 *     // Define capabilities
 *   };
 * 
 *   init(): Observable<void> {
 *     // Initialize source
 *   }
 * 
 *   refresh(params?: FireSourceParams): Observable<readonly FireEvent[]> {
 *     // Refresh data
 *   }
 * 
 *   destroy(): void {
 *     // Cleanup
 *   }
 * 
 *   healthCheck(): Observable<boolean> {
 *     // Check health
 *   }
 * 
 *   sourceStats(): SourceStats {
 *     // Return stats
 *   }
 * }
 * ```
 * 
 * State Management:
 * - Uses Angular signals for reactive state management
 * - Provides readonly access to internal state
 * - Maintains consistent state across all implementations
 * 
 * Error Handling:
 * - Supports multiple error severity levels
 * - Tracks recoverable vs non-recoverable errors
 * - Provides error clearing functionality
 * - Maintains error history
 * 
 * Connection Management:
 * - Tracks connection status
 * - Monitors error counts
 * - Provides status update mechanism
 * - Maintains connection state
 * 
 * Note: This is an abstract base class that should be extended by specific
 * fire source implementations. It provides the common infrastructure and
 * patterns that all fire sources should follow.
 */

import { Injectable, signal, computed } from "@angular/core";
import { Observable } from "rxjs";
import { 
  DataSourceType, 
  ErrorSeverity, 
  FireSourceError, 
  FireSourceParams,
  FireEvent,
  SourceStats,
  ConnectionStatus,
  DataSourceCapabilities
} from "../models";


@Injectable()
export abstract class FireSourceBaseService {
  protected readonly _loading = signal(false);
  protected readonly _error = signal<FireSourceError | null>(null);
  protected readonly _features = signal<readonly FireEvent[]>([]);
  protected readonly _connectionStatus = signal<ConnectionStatus>({
    connected: false,
    errorCount: 0
  });

  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly features = this._features.asReadonly();
  public readonly connectionStatus = this._connectionStatus.asReadonly();

  abstract readonly sourceType: DataSourceType;
  abstract readonly sourceCapabilities: DataSourceCapabilities;

  abstract init(): Observable<void>;
  abstract refresh(params?: FireSourceParams): Observable<readonly FireEvent[]>;
  abstract destroy(): void;
  abstract healthCheck(): Observable<boolean>;
  abstract sourceStats(): SourceStats;

  public isReady(): boolean {
    return !this._loading() && !this._error();
  }

  getSourceInfo(): { type: DataSourceType; capabilities: DataSourceCapabilities, ready: boolean; hasData: boolean } {
    return {
      type: this.sourceType,
      capabilities: this.sourceCapabilities,
      ready: this.isReady(),
      hasData: this.features().length > 0,
    };
  }

  protected handleError(error: Error, severity: ErrorSeverity = ErrorSeverity.ERROR): void {
    this._error.set({
      message: error.message,
      severity,
      timestamp: new Date(),
      recoverable: severity !== ErrorSeverity.CRITICAL
    });
  }

  protected clearError(): void {
    this._error.set(null);
  }

  protected updateConnectionStatus(status: Partial<ConnectionStatus>): void {
    this._connectionStatus.update(current => ({
      ...current,
      ...status
    }));
  }

  // Default implementation for clearing data
  protected clearData?(): void;
}
