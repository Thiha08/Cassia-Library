/**
 * Worker Source Models
 * 
 * This module defines the core types and interfaces for the Web Worker-based
 * fire data processing system. It provides type-safe communication between
 * the main thread and worker thread.
 * 
 * Key Components:
 * 1. Message Types
 *    - INIT: Worker initialization
 *    - PARSE: Raw data parsing
 *    - DELTA: Delta update processing
 *    - FILTER: Spatial filtering
 *    - CONVERT_TO_FEATURES: Feature conversion
 *    - PARSE_AND_FILTER: Combined parsing and filtering
 *    - MERGE_FEATURES: Feature merging
 *    - DEDUPLICATE: Feature deduplication
 * 
 * 2. Communication Models
 *    - WorkerMessage: Outgoing messages to worker
 *    - WorkerResponse: Incoming messages from worker
 *    - WorkerResult: Processing results
 *    - WorkerProcessingStats: Performance metrics
 * 
 * 3. Payload Types
 *    - ConvertToFeaturesPayload: Feature conversion parameters
 *    - ParseAndFilterPayload: Data parsing and filtering parameters
 *    - FeatureStyleOptions: Feature styling configuration
 */

import { Observable } from 'rxjs';
import { Feature } from 'ol';
import { FireEvent } from '../base/fire-source-base.model';

/**
 * Processing statistics for worker operations
 */
export interface WorkerProcessingStats {
  /** Number of items processed */
  itemsProcessed: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Whether worker was used for processing */
  workerUsed: boolean;
}

/**
 * Message sent to the worker thread
 */
export interface WorkerMessage {
  /** Unique message identifier */
  id: string;
  /** Type of operation to perform */
  type: WorkerMessageType;
  /** Operation-specific payload */
  payload: any;
}

/**
 * Types of operations supported by the worker
 */
export enum WorkerMessageType {
  /** Initialize worker */
  INIT = 'init',
  /** Parse raw data */
  PARSE = 'parse',
  /** Process delta updates */
  DELTA = 'delta',
  /** Apply spatial filtering */
  FILTER = 'filter',
  /** Convert to OpenLayers features */
  CONVERT_TO_FEATURES = 'convert_to_features',
  /** Combined parse and filter operation */
  PARSE_AND_FILTER = 'parse_and_filter',
  /** Merge multiple feature sets */
  MERGE_FEATURES = 'merge_features',
  /** Remove duplicate features */
  DEDUPLICATE = 'deduplicate'
}

/**
 * Response from the worker thread
 */
export interface WorkerResponse {
  /** Original message identifier */
  id: string;
  /** Type of operation performed */
  type: WorkerMessageType;
  /** Whether operation was successful */
  success: boolean;
  /** Operation result data */
  data?: any;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Parameters for feature conversion
 */
export interface ConvertToFeaturesPayload {
  /** Fire events to convert */
  events: FireEvent[];
  /** Optional styling configuration */
  styleOptions?: FeatureStyleOptions;
}

/**
 * Feature styling configuration
 */
export interface FeatureStyleOptions {
  /** Base radius for feature points */
  baseRadius?: number;
  /** Maximum radius for feature points */
  maxRadius?: number;
  /** Minimum opacity value */
  minOpacity?: number;
  /** Maximum opacity value */
  maxOpacity?: number;
}

/**
 * Parameters for parsing and filtering
 */
export interface ParseAndFilterPayload {
  /** Raw data to parse */
  data: string;
  /** Optional filtering parameters */
  params?: {
    /** Bounding box for spatial filtering */
    bbox?: [number, number, number, number];
    /** Time range for temporal filtering */
    range?: {
      from: Date;
      to: Date;
    };
  };
}

/**
 * Result of worker processing
 */
export interface WorkerResult {
  /** Generated OpenLayers features */
  features: Feature[];
  /** Processing statistics */
  stats: {
    /** Number of items processed */
    processed: number;
    /** Number of items filtered out */
    filtered: number;
    /** Processing duration in milliseconds */
    duration: number;
  };
}

/** Observable type for worker results */
export type WorkerObservable = Observable<WorkerResult>;