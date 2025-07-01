import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

export enum FireLayerMode {
  NORMAL = 'normal',
  CLUSTER = 'cluster',
  HEATMAP = 'heatmap',
  REPLAY = 'replay'
}

export enum FireLayerType {
  POINTS = 'points',
  HEATMAP = 'heatmap',
  SMOKE = 'smoke',
  CLUSTER = 'cluster',
}

export interface FireFilterOptions {
  timeRange: { from: Date; to: Date } | null;
  region: string | null;
  severity: string | null;
  clustering: boolean;
  heatmap: boolean;
}

export interface FireLayerState {

  // Core states
  loading: boolean;
  error: any | null;
  mode: FireLayerMode;

   // Filter states
  filterOptions: FireFilterOptions;

   // Feature states
  selectedFeature: Feature<Geometry> | null;
  hoveredFeature: Feature<Geometry> | null;

  // Replay states
  replayMode: boolean;
  replayIndex: number;

  // Layer states
  layerVisibility: {
    points: boolean;
    clusters: boolean;
    heatmap: boolean;
    smoke: boolean;
  };
}

export interface FireLayerConfig {
  clusteringDistance?: number;
  heatmapIntensity?: number;
  popupOffset?: [number, number];
  tooltipOffset?: [number, number];
  replayInterval?: number;
}

export interface FireLayerStats {
  totalFeatures: number;
  visibleFeatures: number;
  clusteredFeatures: number;
  lastUpdate: Date;
} 