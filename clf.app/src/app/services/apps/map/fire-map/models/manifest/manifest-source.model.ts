import { Extent } from "ol/extent";
import { FireEvent } from "../base/fire-source-base.model";

export interface CacheRevision {
    id: string;
    bbox: Extent;
    timestamp: Date;
    version: number;
    size: number;
    compressed: boolean;
    expiresAt: Date;
    source: 'api' | 'local' | 'realtime';
  }
  
  export interface CacheMetadata {
    totalSize: number;
    revisionCount: number;
    lastCleanup: Date;
    storageQuota?: number;
    usedSpace?: number;
  }
  
  export interface StorageConfig {
    maxCacheSize: number; // MB
    defaultExpiration: number; // hours
    compressionLevel: number;
    autoCleanup: boolean;
    spatialIndexPrecision: number;
  }
  
  export interface CacheMetrics {
    readLatency: number;
    writeLatency: number;
    compressionRatio: number;
    cacheHitRate: number;
    memoryUsage: number;
    storageUsage: number;
  }
  
  export interface CacheStrategy {
    type: 'lru' | 'lfu' | 'fifo';
    maxSize: number;
    maxAge: number;
    cleanupInterval: number;
    maxMemoryEntries: number; // Configurable number of memory cache entries
    compressionThreshold: number; // Size threshold for compression
    batchSize: number; // Number of items to process in a batch
  }
  
  export interface MemoryCacheEntry {
    data: FireEvent[];
    timestamp: number;
    size: number;
    bbox?: Extent;
    revisionId: string;
    lastAccess: number;
  }
  
  export interface ErrorContext {
    operation: string;
    timestamp: Date;
    stack?: string;
    additionalInfo?: Record<string, any>;
  }