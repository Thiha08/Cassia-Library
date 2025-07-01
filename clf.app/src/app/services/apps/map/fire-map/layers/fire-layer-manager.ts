import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, tap, takeUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';
import Heatmap from 'ol/layer/Heatmap';
import Feature, { FeatureLike } from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { Point } from 'ol/geom';
import { Style } from 'ol/style';
import { Extent } from 'ol/extent';
import { Interaction } from 'ol/interaction';
import { Overlay } from 'ol';
import { FireSourceManager } from '../data-source/fire-source.manager';
import { 
  FireFilterOptions, 
  FireLayerState, 
  FireLayerMode,
  FireLayerConfig,
  FireLayerStats, 
  FireLayerType
} from '../models/layer/fire-layer.models';
import { InteractionState } from '../models/interaction/interaction.model';
import { FireStyleManager } from '../styles/fire-style-manager';
import { FireInteractionManager } from '../interaction/fire-interaction-manager';
import { FireEvent } from '../models/base/fire-source-base.model';
import { fromLonLat, toLonLat } from 'ol/proj';
import { CircleOpts, CustomRenderer } from 'src/app/pages/mapboards/mapboard6/custom-renderer';
import { TownshipLayerService } from '../../township-layer.service';


/**
 * FireLayerManager
 * 
 * Central manager for fire-related map layers and interactions.
 * Coordinates between data sources, OpenLayers map, and UI components.
 * 
 * Key Responsibilities:
 * 1. Layer Management
 *    - Creating and managing OpenLayers layers
 *    - Handling layer visibility and opacity
 *    - Vector layer for fire points
 *    - Clustering support
 *    - Heatmap visualization
 *    - Smoke overlays
 * 
 * 2. Data Integration
 *    - FireSourceManager integration
 *    - Converting FireEvents to OpenLayers features
 *    - Managing feature updates and caching
 *    - Handling data refresh and filtering
 * 
 * 2. State Management
 *    - Managing loading and error states
 *    - Filter state
 *    - Selection state
 *    - Replay mode
 *    - Loading states
 * 
 * 3. Interaction Handling
 *    - Coordinating with FireInteractionManager
 *    - Managing popups and tooltips
 *    - Handling map events and gestures
 * 
 * 4. Performance Management
 *    - Tracking feature updates
 *    - Managing layer performance
 *    - Handling data refresh
 * 
 * 5. Cleanup
 *    - Unsubscribing from observables
 *    - Cleaning up resources
 * 
 * 6. Configuration
 *    - Managing layer configurations
 *    - Handling layer visibility
 *    - Managing layer opacity
 * 
 * 7. Error Handling
 *    - Handling errors from data sources
 *    - Managing error states
 *    - Handling error messages
 * 
 * 8. Logging
 *    - Logging layer operations
 *    - Logging performance metrics
 * 
 * 9. Testing
 *    - Unit testing
 *    - Integration testing
 *    - Performance testing
 * 
 * 10. Documentation
 *    - Writing layer manager documentation
 *    - Updating layer manager documentation
 */

interface FireFeatureProperties {
  id?: string;
  source?: string;
  timestamp: string;
  confidence: number;
  brightness: number;
  intensity: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class FireLayerManager implements OnDestroy {
  // Dependencies
  private fireSourceManager = inject(FireSourceManager);
  private styleManager = inject(FireStyleManager);
  private interactionManager = inject(FireInteractionManager);
  private townshipService = inject(TownshipLayerService);
  // private overlayManager = inject(FireOverlayManager);
  //private performanceManager = inject(FirePerformanceManager);

  private destroy$ = new Subject<void>();

  // OpenLayers instances
  private _map: Map | null = null;
  private _fireSource: VectorSource<Feature<Geometry>> | null = null;
  private _fireLayer: VectorLayer<VectorSource<Feature<Geometry>>> | null = null;
  private _clusterSource: Cluster<Feature<Geometry>> | null = null;
  private _clusterLayer: VectorLayer<VectorSource<Feature<Geometry>>> | null = null;
  private _heatmapLayer: Heatmap | null = null;
  private _smokeLayer: VectorLayer<VectorSource<Feature<Geometry>>> | null = null;
  private _overlays: Record<string, Overlay> = {};
  private _interactions: Record<string, Interaction> = {};

  private _townshipLayer: VectorLayer<VectorSource<Feature<Geometry>>> | null = null;

  // State management
  private _state$ = new BehaviorSubject<FireLayerState>({
    loading: false,
    error: null,
    mode: FireLayerMode.NORMAL,
    filterOptions: {
      timeRange: null,
      region: null,
      severity: null,
      clustering: false,
      heatmap: false
    },
    selectedFeature: null,
    hoveredFeature: null,
    replayMode: false,
    replayIndex: 0,
    layerVisibility: {
      points: true,
      clusters: false,
      heatmap: false,
      smoke: false
    }
  });

  // Public signals
  readonly state$ = this._state$.asObservable();
  readonly loading$ = this.state$.pipe(map(s => s.loading), distinctUntilChanged());
  readonly error$ = this.state$.pipe(map(s => s.error), distinctUntilChanged());
  readonly mode$ = this.state$.pipe(map(s => s.mode), distinctUntilChanged());
  readonly filterOptions$ = this.state$.pipe(map(s => s.filterOptions), distinctUntilChanged());
  readonly selectedFeature$ = this.state$.pipe(map(s => s.selectedFeature), distinctUntilChanged());
  readonly hoveredFeature$ = this.state$.pipe(map(s => s.hoveredFeature), distinctUntilChanged());
  readonly replayMode$ = this.state$.pipe(map(s => s.replayMode), distinctUntilChanged());
  readonly replayIndex$ = this.state$.pipe(map(s => s.replayIndex), distinctUntilChanged());

  // Feature cache
  private _featureCache : Record<string, Feature<Geometry>> = {};

  // Subscriptions
  private _subscriptions: Subscription[] = [];

  constructor() {
    this.setupSubscriptions();
  }

  // Public Methods

  /**
   * Initialize the layer manager with an OpenLayers map instance
   */
  initialize(map: Map): void {
    this._map = map;
    this.initializeLayers();
    //this.initializeInteractions();
    this.setupSubscriptions();
    this.setupMapListeners();
  }

  /**
   * Layer Management
   */
  toggleLayer(layerType: FireLayerType, visible: boolean): void {
    const currentState = this._state$.value;
    const newState = {
      ...currentState,
      layerVisibility: {
        ...currentState.layerVisibility,
        [layerType]: visible
      }
    };
    this._state$.next(newState);

    // Update layer visibility
    switch (layerType) {
      case FireLayerType.POINTS:
        this._fireLayer?.setVisible(visible);
        break;
      case FireLayerType.CLUSTER:
        this._clusterLayer?.setVisible(visible);
        break;
      case FireLayerType.HEATMAP:
        this._heatmapLayer?.setVisible(visible);
        break;
      case FireLayerType.SMOKE:
        this._smokeLayer?.setVisible(visible);
        break;
    }
  }

  setLayerOpacity(layerType: FireLayerType, opacity: number): void {
    switch (layerType) {
      case FireLayerType.POINTS:
        this._fireLayer?.setOpacity(opacity);
        break;
      case FireLayerType.CLUSTER:
        this._clusterLayer?.setOpacity(opacity);
        break;
      case FireLayerType.HEATMAP:
        this._heatmapLayer?.setOpacity(opacity);
        break;
      case FireLayerType.SMOKE:
        this._smokeLayer?.setOpacity(opacity);
        break;
    }
  }

  setLayerStyle(layerType: FireLayerType, style: Style): void {
    switch (layerType) {
      case FireLayerType.POINTS:
        this._fireLayer?.setStyle(style);
        break;
      case FireLayerType.CLUSTER:
        this._clusterLayer?.setStyle(style);
        break;
      case FireLayerType.HEATMAP:
        this._heatmapLayer?.setStyle(style);
        break;
      case FireLayerType.SMOKE:
        this._smokeLayer?.setStyle(style);
        break;
    }
  }

  /**
   * Data Management
   */
  refreshData(): void {
    console.log('FireLayerManager: Refreshing data');
    const { filterOptions } = this._state$.value;
    if (!filterOptions || !this._map) return;

    // const extent = this._map.getView().calculateExtent();
    // // Transform from Web Mercator to Geographic coordinates using OpenLayers utilities
    // const minCoords = toLonLat([extent[0], extent[1]]); // minLon, minLat
    // const maxCoords = toLonLat([extent[2], extent[3]]); // maxLon, maxLat
    // const bbox: [number, number, number, number] = [
    //   minCoords[0], minCoords[1],
    //   maxCoords[0], maxCoords[1]
    // ];

    const extent = this._map.getView().calculateExtent();
    const bbox: [number, number, number, number] = [
      extent[0], extent[1],  // minLon, minLat
      extent[2], extent[3]   // maxLon, maxLat
    ];

    this.fireSourceManager.refresh({
      range: filterOptions.timeRange || undefined,
      bbox,
      filters: {
        region: filterOptions.region,
        severity: filterOptions.severity
      }
    }).subscribe({
      next: (events) => {
        console.log('FireLayerManager: refreshData - Received events:', events.length);
        // Handle the events here if needed
      },
      error: (error) => {
        console.error('FireLayerManager: refreshData - Error refreshing data:', error);
      }
    });
  }

  clearData(): void {
    if (this._fireSource) {
      this._fireSource.clear();
    }
    this._featureCache = {};
    this.townshipService.resetHighlight();
    console.log('FireLayerManager: Data cleared and township highlights reset');
  }

  /**
   * Get township statistics for debugging
   */
  getTownshipStats(): { total: number; loaded: number; cached: boolean } {
    return this.townshipService.getStats();
  }

  /**
   * Feature Management
   */
  selectFeature(feature: Feature<Geometry> | null): void {
    const currentState = this._state$.value;
    this._state$.next({
      ...currentState,
      selectedFeature: feature
    });

    if (feature) {
      this.showPopup(feature);
    } else {
      this.hidePopup();
    }
  }

  highlightFeature(feature: Feature<Geometry> | null): void {
    const currentState = this._state$.value;
    this._state$.next({
      ...currentState,
      hoveredFeature: feature
    });
  }

  getFeatureById(id: string): Feature<Geometry> | null {
    return this._featureCache[id] || null;
  }

  /**
   * View Controls
   */
  zoomToFeature(feature: Feature<Geometry>): void {
    if (!this._map) return;
    const geometry = feature.getGeometry();
    if (geometry) {
      this._map.getView().fit(geometry.getExtent(), {
        padding: [50, 50, 50, 50],
        duration: 500
      });
    }
  }

  zoomToExtent(extent: Extent): void {
    if (!this._map) return;
    this._map.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      duration: 500
    });
  }

  fitToFeatures(features: Feature<Geometry>[]): void {
    if (!this._map || features.length === 0) return;
    const extents = features
      .map(f => f.getGeometry()?.getExtent())
      .filter((extent): extent is Extent => extent !== undefined);
    
    if (extents.length > 0) {
      const combinedExtent = extents.reduce((acc, curr) => {
        return [
          Math.min(acc[0], curr[0]),
          Math.min(acc[1], curr[1]),
          Math.max(acc[2], curr[2]),
          Math.max(acc[3], curr[3])
        ];
      });
      this.zoomToExtent(combinedExtent);
    }
  }

  // Private Methods

  private setupSubscriptions(): void {
    // Subscribe to data source updates
    this._subscriptions.push(
      this.fireSourceManager.events$.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap(events => console.log('FireLayerManager: setupSubscriptions - Received events:', events.length))
      ).subscribe(events => {
        this.updateFeatures(events);
      })
    );

    // Subscribe to loading state
    this._subscriptions.push(
      this.fireSourceManager.loading$.pipe(
        takeUntil(this.destroy$),
        tap(loading => console.log('FireLayerManager: Loading state:', loading))
      ).subscribe(loading => {
        this.updateLoadingState(loading);
      })
    );

    // Subscribe to error state
    this._subscriptions.push(
      this.fireSourceManager.error$.pipe(
        takeUntil(this.destroy$),
        tap(error => console.log('FireLayerManager: Error state:', error))
      ).subscribe(error => {
        this.updateErrorState(error);
      })
    );

    // Subscribe to interaction events
    this.interactionManager.state$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(state => {
        this.handleInteractionState(state);
      });
  }

   /**
   * Initialize the layer manager
   */
  private initializeLayers(): void {
    console.log('FireLayerManager: Initializing layers');
    if (!this._map) {
      console.warn('FireLayerManager: No map instance available');
      return;
    }

    // Initialize vector source and layer
    this._fireSource = new VectorSource();
    this._fireLayer = new VectorLayer({
      source: this._fireSource,
      style: (feature, resolution) => this.getNewsStyleV2(feature, resolution),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      declutter: true,
      minZoom: 10,
      zIndex: 20000,
    });

    // Add base layer to map
    this._map.addLayer(this._fireLayer);
    console.log('FireLayerManager: Added fire layer to map');

     // Initialize township layer with lazy loading
     this.townshipService.initialize().subscribe(() => {
      const townshipLayer = this.townshipService.getLayer();
      if (townshipLayer && this._map) {
        this._townshipLayer = townshipLayer;
        this._map.addLayer(townshipLayer);
        console.log('FireLayerManager: Township layer added to map');
      }
    });
  }

    /** 1️⃣ Define ring‐colors per event type */
    private readonly newsTypeColors: Record<string, string> = {
      ceasefire: '#FFD700',   // gold
      warning_shots: '#FF4500',    // orangered
      base_capture: '#00CED1',    // darkturquoise
      air_bombing: '#FF69B4',    // hotpink
      artillery: '#8A2BE2',    // blueviolet
      attack: '#FF6347',    // tomato
      reentry: '#ADFF2F',    // greenyellow
      // …add other types here…
    };

    private getNewsStyleV2(feature: FeatureLike, resolution: number): Style {
      const zoom = this._map?.getView().getZoomForResolution(resolution)!;
      const type = feature.get('type') as string;
      const ringColor = this.newsTypeColors[type] ?? '#FF4500'; // Outer ring color
      const innerColor = ringColor; // Inner circle color
  
      const innerCircleRenderer = (pixels: any, state: any) => {
        CustomRenderer.drawCircle(
          state.context,
          { x: pixels[0], y: pixels[1] },
          zoom,
          {
            radius: 6,
            fillColor: innerColor,
            strokeColor: ringColor,
            strokeWidth: 5,
          } as CircleOpts
        );
      }
  
      const outerCircleRenderer = (pixels: any, state: any) => {
        CustomRenderer.drawCircle(
          state.context,
          { x: pixels[0], y: pixels[1] },
          zoom,
          {
            radius: 10,
            fillColor: 'rgba(255, 255, 255, 1)',
            strokeColor: ringColor,
            strokeWidth: 5,
          } as CircleOpts
        );
      }
  
      return new Style({
        renderer: (pixels: any, state: any) => {
          outerCircleRenderer(pixels, state);
          innerCircleRenderer(pixels, state);
        }
      });
    }

  /**
   * Initialize the layer manager
   */
  private initializeInteractions(): void {
    if (!this._map) return;

    this.interactionManager.initialize(this._map, {
      enableClick: true,
      enableHover: true,
      enableDrag: true,
      enableZoom: true,
      enablePopup: true,
      enableTooltip: true
    });
  }

  private setupMapListeners(): void {
    if (!this._map) return;

    this._map.on('moveend', () => {
      console.log('FireLayerManager: Map moved');
      this.refreshData();
    });

    // this._map.on('click', (event) => {
    //   this.handleMapClick(event);
    // });

    // this._map.on('pointermove', (event) => {
    //   this.handleMapHover(event);
    // });
  }

  private handleMapClick(event: any): void {
    if (!this._map) return;
    const feature = this._map.forEachFeatureAtPixel(event.pixel, 
      (f) => f
    );
    // this.selectFeature(feature);
  }

  private handleMapHover(event: any): void {
    if (!this._map) return;
    const feature = this._map.forEachFeatureAtPixel(event.pixel, 
      (f) => f
    );
    // this.highlightFeature(feature);
  }

  /**
   * Update features from events
   */
  private updateFeatures(events: readonly FireEvent[]): void {
    console.log('FireLayerManager: Updating features with', events.length, 'events');
    if (!this._fireSource) {
      console.warn('FireLayerManager: No fire source available');
      return;
    }

    const features = events.map(event => this.createFeature(event));
    console.log('FireLayerManager: Created', features.length, 'features');
    
    this._fireSource.clear();
    this._fireSource.addFeatures(features);

    this.updateFeatureCache(features);
    // this.performanceManager.recordFeatureUpdate(features.length);

    // Trigger a map render
    // this._map?.render();
  }

  /**
   * Creates an OpenLayers feature from a FireEvent
   * @param event The fire event to convert
   * @returns An OpenLayers feature
   */
  private createFeature(event: FireEvent): Feature<Geometry> {
    //console.log('FireLayerManager: Creating feature for event:', event);
    const feature = new Feature<Geometry>({
      // geometry: new Point(fromLonLat(event.geometry.coordinates))
      geometry: new Point(event.geometry.coordinates)
    });

    // Set feature properties
    feature.setId(event.id);
    feature.set('source', event.source);
    feature.set('timestamp', event.properties.timestamp);
    feature.set('confidence', event.properties.confidence);
    feature.set('brightness', event.properties.brightness);
    feature.set('intensity', event.properties.intensity);
    
    // Handle township highlighting if event has township information
    if (event.township) {
      const township = this.townshipService.findTownshipByName(event.township);
      if (township) {
        console.log(`FireLayerManager: Found township for fire event: ${township.name}`);
        this.townshipService.highlightTownship(township);
      } else {
        console.warn(`FireLayerManager: Township not found: ${event.township}`);
      }
    }

    return feature;
  }

  private updateFeatureCache(features: Feature<Geometry>[]): void {
    features.forEach(feature => {
      const id = feature.get('id');
      if (id) {
        this._featureCache[id] = feature;
      }
    });
  }

  /**
   * Handle interaction state changes
   */
  private handleInteractionState(state: InteractionState): void {
    const currentState = this._state$.value;
    
    this._state$.next({
      ...currentState,
      selectedFeature: state.activeFeature,
      hoveredFeature: state.hoveredFeature
    });

    if (state.activeFeature) {
      // this.overlayManager.showPopup(state.activeFeature, state.lastClickCoordinate!);
    } else {
      // this.overlayManager.hidePopup();
    }
  }

  private updateLoadingState(loading: boolean): void {
    const currentState = this._state$.value;
    this._state$.next({
      ...currentState,
      loading
    });
  }

  private updateErrorState(error: any): void {
    const currentState = this._state$.value;
    this._state$.next({
      ...currentState,
      error
    });
  }

  private enableClustering(): void {
    if (!this._fireSource || !this._map) return;

    this._clusterSource = new Cluster({
      distance: 40,
      source: this._fireSource
    });

    this._clusterLayer = new VectorLayer({
      source: this._clusterSource,
      // Style will be set based on mode
    });

    this._map.addLayer(this._clusterLayer);
  }

  private disableClustering(): void {
    if (!this._clusterLayer || !this._map) return;

    this._map.removeLayer(this._clusterLayer);
    this._clusterLayer = null;
    this._clusterSource = null;
  }

  private enableHeatmap(): void {
    if (!this._fireSource || !this._map) return;

    this._heatmapLayer = new Heatmap({
      source: this._fireSource,
      // Style will be set based on mode
    });

    this._map.addLayer(this._heatmapLayer);
  }

  private disableHeatmap(): void {
    if (!this._heatmapLayer || !this._map) return;

    this._map.removeLayer(this._heatmapLayer);
    this._heatmapLayer = null;
  }

  private showPopup(feature: Feature<Geometry>): void {
    if (!this._map) return;
    const geometry = feature.getGeometry();
    if (geometry) {
      // const coordinate = geometry.getCoordinates();
      // this.overlayManager.showPopup(feature, coordinate);
    }
  }

  private hidePopup(): void {
    // this.overlayManager.hidePopup();
  }

  private cleanupLayers(): void {
    if (!this._map) return;

    if (this._fireLayer) {
      this._map.removeLayer(this._fireLayer);
    }
    if (this._clusterLayer) {
      this._map.removeLayer(this._clusterLayer);
    }
    if (this._heatmapLayer) {
      this._map.removeLayer(this._heatmapLayer);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this.cleanupLayers();
  }
}
