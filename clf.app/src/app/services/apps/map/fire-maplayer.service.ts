import { Injectable, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription, throwError, timer } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap, finalize } from 'rxjs/operators';

import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import HeatmapLayer from 'ol/layer/Heatmap';
import ImageLayer from 'ol/layer/Image';
import ImageCanvas from 'ol/source/ImageCanvas';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon, Text } from 'ol/style';
import Cluster from 'ol/source/Cluster';
import { fromLonLat } from 'ol/proj';
import { Extent, Select, Translate } from 'ol/interaction';
import { click } from 'ol/events/condition';
import WebGLVectorLayer from 'ol/layer/WebGLVector';
import Geometry from 'ol/geom/Geometry';
import { FeatureLike } from 'ol/Feature';
import BaseEvent from 'ol/events/Event';
import { ObjectEvent } from 'ol/Object';

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface FireLayerInitOpts {
  refreshMinutes?: number;   // default 15
  heatmapRadius?: number;    // px, default 14
  smokeOpacity?: number;     // 0‑1, default 0.4
}

export interface IFireMapLayerService {

  // State (Signals)
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly statistics: Signal<{ count: number; lastEventTime?: Date }>;
  readonly isDataAvailable: Signal<boolean>;
  readonly visibleFeatures: Signal<Feature[]>;
  readonly selectedFeature: Signal<Feature | undefined>;

  // Initialization
  init(map: Map, opts?: FireLayerInitOpts): void;

  // Data
  fetchFireData(forceRefresh?: boolean): Observable<FireEvent[]>;
  reloadData(params?: { bbox?: Extent; timerange?: TimeRange; forceRefresh?: boolean }): Observable<void>;

  // Realtime
  connectRealtime(socketUrl: string): void;
  disconnectRealtime(): void;

  // Layers Group
  setLayerGroupVisible(visible: boolean): void;
  setLayerGroupOpacity(opacity: number): void;

  // Layer
  setLayerVisible(layerType: FireLayerType, visible: boolean): void;
  setLayerOpacity(layerType: FireLayerType, opacity: number): void;

  // Cleanup
  destroy(): void;
}

@Injectable({
  providedIn: 'root'
})
export class FireMapLayerService implements IFireMapLayerService {

  /* ---------- private state ---------- */
  private map?: Map;
  private fireEvents = signal<FireData[]>([]);

  private opts: Required<FireLayerInitOpts> = {
    refreshMinutes: 15,
    heatmapRadius: 14,
    smokeOpacity: 0.4,
  } as Required<FireLayerInitOpts>;

  private firestate = signal<FireMapState>({
    rawData: [],
    filteredData: [],
    timelineRange: [new Date(), new Date()],
    selectedEvent: null
  });

  // Sub‑layers
  private heatLayer?: HeatmapLayer;
  private iconLayer?: WebGLVectorLayer | VectorLayer<VectorSource>;
  private smokeLayer?: ImageLayer<ImageCanvas>; // Add generic type parameter

  // Realtime feed
  private realtimeSub?: Subscription;

  // Observables for UI
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);
  private readonly _stats$ = new BehaviorSubject<{ count: number; lastUpdate: Date }>(null as unknown as { count: number; lastUpdate: Date }); // Fix non-nullable type issue

  /* ---------- public streams ---------- */
  readonly loading$ = this._loading$.asObservable();
  readonly error$   = this._error$.asObservable();
  readonly stats$   = this._stats$.asObservable() as Observable<{ count: number; lastUpdate: Date }>; // Type cast to match interface

  private apiUrl = 'https://api.example.com/fires';
  private cacheKey = 'fire_data_cache';
  private cacheDuration = 30 * 60 * 1000; // 30 minutes


  private layersMap = new Map<string, any>();
  private fireIconCache = new Map<string, Style>();

  // Private subscriptions collection for better management
  private subscriptions = new Subscription();

  // Track subscription for each layer to avoid memory leaks
  private layerSubscriptions = new Map<string, Subscription>();

  // Performance optimization for style caching
  private styleCache = new Map<string, any>();

  constructor(private http: HttpClient) {}

  /* ---------- life‑cycle ---------- */
  init(map: Map, opts?: FireLayerInitOpts): void {
    if (this.map) {
      console.warn('Map already initialized');
      return;
    }

    this.map = map;

    if (opts) {
      // Use type-safe approach to merge options
      this.opts = {
        ...this.opts,
        ...Object.entries(opts).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            (acc as any)[key] = value;
          }
          return acc;
        }, {} as Partial<Required<FireLayerInitOpts>>)
      };
    }

    // Build sub-layers and group them (but we keep direct refs for config)
    this.heatLayer = this.buildHeatmapLayer();
    this.iconLayer = this.buildIconLayer();
    this.smokeLayer = this.buildSmokeLayer();

    // Add layers to map in correct z-order
    map.addLayer(this.smokeLayer!);
    map.addLayer(this.heatLayer!);
    map.addLayer(this.iconLayer!);

    // Register all layers in the map
    this.layersMap.set('heatmap', this.heatLayer);
    this.layersMap.set('icons', this.iconLayer);
    this.layersMap.set('smoke', this.smokeLayer);

    // Initial & scheduled refresh
    this.reload();
    const refreshSub = timer(0, this.opts.refreshMinutes * 60_000).subscribe(() => this.reload());
    this.subscriptions.add(refreshSub);
  }


  /* ---------- data handling ---------- */
  async reload(bbox?: Extent, timerange?: TimeRange): Promise<void> {
    if (!this.map) { return; }
    this._loading$.next(true);

    try {
      const fireData = await this.fetchFireData(true).toPromise();
      const features = this.convertFireDataToFeatures(fireData);
      this.upsertFeatures(features);
      this._stats$.next({ count: features.length, lastUpdate: new Date() });
      this._error$.next(null);
    } catch (err: any) {
      console.error('Error in reload:', err);
      this._error$.next(err.message || 'Unknown error');
    } finally {
      this._loading$.next(false);
    }
  }

  subscribeRealtime(socketUrl: string): void {
    if (this.realtimeSub) {
      console.warn('Realtime subscription already active');
      return;
    }

    try {
      // Very light example – replace with proper WebSocket logic
      this.realtimeSub = timer(0, 30_000).pipe( // mock 30‑s tick
        switchMap(() => {
          console.log('Refreshing fire data from realtime feed');
          return this.reload();
        })
      ).subscribe({
        error: (err) => {
          console.error('Error in realtime subscription:', err);
          this._error$.next(`Realtime feed error: ${err.message || 'Unknown error'}`);
          // Auto-reconnect after error
          setTimeout(() => this.subscribeRealtime(socketUrl), 5000);
        }
      });

      this.subscriptions.add(this.realtimeSub);
    } catch (err: any) {
      console.error('Failed to start realtime subscription:', err);
      this._error$.next(`Failed to connect to realtime feed: ${err.message || 'Unknown error'}`);
    }
  }

  pauseRealtime(): void {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
      this.realtimeSub = undefined;
    }
  }

  /* ---------- visibility & styling ---------- */
  setVisible(flag: boolean): void {
    // Fix Map.forEach issues
    Array.from(this.layersMap.entries()).forEach(([key, layer]) => {
      if (layer && typeof layer.setVisible === 'function') {
        layer.setVisible(flag);
      }
    });
  }

  setHeatmapEnabled(flag: boolean): void {
    const layer = this.layersMap.get('heatmap') || this.heatLayer;
    if (layer) {
      layer.setVisible(flag);
    }
  }

  setSmokeEnabled(flag: boolean): void {
    const layer = this.layersMap.get('smoke') || this.smokeLayer;
    if (layer) {
      layer.setVisible(flag);
    }
  }

  setOpacity(opacity: number): void {
    const smokeLayer = this.layersMap.get('smoke') || this.smokeLayer;
    if (smokeLayer) {
      smokeLayer.setOpacity(Math.max(0, Math.min(1, opacity))); // Clamp between 0-1
    }
  }

  setHeatmapRadius(px: number): void {
    const heatLayer = this.layersMap.get('heatmap') || this.heatLayer;
    if (heatLayer && typeof (heatLayer as any).setRadius === 'function') {
      (heatLayer as any).setRadius(px);
      this.opts.heatmapRadius = px;
    }
  }

  setIconScale(scaleFn: (r: number) => number): void {
    this.iconLayer?.setStyle((feature, res) => this.iconStyle(feature, res, scaleFn));
  }

  /* ---------- interaction ---------- */
  onSelect(cb: (f: Feature) => void): Subscription {
    // Fix event handling
    const subscription = new Subscription();
    if (this.iconLayer) {
      this.iconLayer.on('click', (event: any) => {
        if (event.feature) {
          cb(event.feature as Feature);
        }
      });
      subscription.add(() => {
        this.iconLayer?.un('click', () => {});
      });
    }
    return subscription;
  }

  onHover(cb: (f?: Feature) => void): Subscription {
    // Fix event handling
    const subscription = new Subscription();
    if (this.iconLayer) {
      this.iconLayer.on('pointermove', (event: any) => {
        cb(event.feature as Feature | undefined);
      });
      subscription.add(() => {
        this.iconLayer?.un('pointermove', () => {});
      });
    }
    return subscription;
  }

  // Data fetching and caching methods - use only this implementation
  fetchFireData(forceRefresh = false): Observable<FireData[]> {
    // Check if we have cached data and it's not a force refresh
    if (!forceRefresh) {
      const cachedData = this.getFromCache();
      if (cachedData) {
        this.fireDataSubject.next(cachedData);
        return of(cachedData);
      }
    }

    this._loading$.next(true);

    return this.http.get<FireData[]>(this.apiUrl).pipe(
      tap(data => {
        this.saveToCache(data);
        this.fireDataSubject.next(data);
      }),
      catchError(error => {
        console.error('Error fetching fire data:', error);
        // If we have cached data, use it even if there's an error
        const cachedData = this.getFromCache();
        if (cachedData) {
          console.log('Using cached fire data after fetch error');
          this.fireDataSubject.next(cachedData);
          return of(cachedData);
        }
        return throwError(() => new Error('Failed to fetch fire data and no cache available'));
      }),
      finalize(() => this._loading$.next(false)),
      shareReplay(1)
    );
  }

  private saveToCache(data: FireData[]): void {
    try {
      const cacheItem = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  private getFromCache(): FireData[] | null {
    try {
      const cacheItem = localStorage.getItem(this.cacheKey);
      if (!cacheItem) return null;

      const { timestamp, data } = JSON.parse(cacheItem);
      const isExpired = Date.now() - timestamp > this.cacheDuration;

      return isExpired ? null : data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  // Layer creation methods - refactored to be more consistent
  createFirePointLayer(map: Map): VectorLayer<VectorSource> {
    if (this.layersMap.has('fire-points')) {
      return this.layersMap.get('fire-points') as VectorLayer<VectorSource>;
    }

    const source = new VectorSource();
    const layer = new VectorLayer({
      source: source,
      style: (feature) => this.getFireIconStyle(feature),
      zIndex: 10,
      properties: {
        title: 'Fire Locations',
        type: 'fire-points'
      }
    });

    this.layersMap.set('fire-points', layer);
    map.addLayer(layer);

    // Subscribe to fire data changes to update the layer - and track subscription
    const subscription = this.fireDataSubject.subscribe(fireData => {
      this.updateLayerFeatures(source, fireData);
    });

    this.layerSubscriptions.set('fire-points', subscription);
    this.subscriptions.add(subscription);

    return layer;
  }

  createFireHeatmapLayer(map: Map): HeatmapLayer {
    if (this.layersMap.has('fire-heatmap')) {
      return this.layersMap.get('fire-heatmap') as HeatmapLayer;
    }

    const source = new VectorSource();
    const layer = new HeatmapLayer({
      source: source,
      blur: 15,
      radius: this.opts.heatmapRadius,
      weight: (feature) => {
        return feature.get('properties')?.intensity / 100 || 0.5;
      },
      gradient: ['rgba(255, 255, 0, 0)', 'rgba(255, 0, 0, 1)'],
      zIndex: 5,
      properties: {
        title: 'Fire Heatmap',
        type: 'fire-heatmap'
      }
    });

    this.layersMap.set('fire-heatmap', layer);
    map.addLayer(layer);

    // Subscribe to fire data changes to update the layer
    const subscription = this.fireDataSubject.subscribe(fireData => {
      this.updateLayerFeatures(source, fireData);
    });

    this.layerSubscriptions.set('fire-heatmap', subscription);
    this.subscriptions.add(subscription);

    return layer;
  }

  createFireClusterLayer(map: Map): VectorLayer<Cluster> {
    const source = new VectorSource();
    const clusterSource = new Cluster({
      distance: 40,
      source: source
    });

    const layer = new VectorLayer({
      source: clusterSource,
      style: (feature) => {
        const size = feature.get('features').length;
        const totalIntensity = feature.get('features').reduce(
          (sum: number, feat: Feature) => sum + (feat.get('properties')?.intensity || 0), 0
        );
        const avgIntensity = totalIntensity / size;

        return this.getClusterStyle(size, avgIntensity);
      },
      zIndex: 8,
      properties: {
        title: 'Fire Clusters',
        type: 'fire-clusters'
      }
    });

    this.layersMap.set('fire-clusters', layer);
    map.addLayer(layer);

    // Subscribe to fire data changes to update the layer
    this.fireDataSubject.subscribe(fireData => {
      source.clear();
      fireData.forEach(fire => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([fire.longitude, fire.latitude])),
          properties: { ...fire }
        });
        source.addFeature(feature);
      });
    });

    return layer;
  }

  createSmokeOverlay(map: Map): ImageLayer<ImageCanvas> {
    const smokeLayer = new ImageLayer({
      source: new ImageCanvas({
        canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
          const canvas = document.createElement('canvas');
          canvas.width = size[0];
          canvas.height = size[1];

          this.renderSmokeOverlay(canvas, extent, size);

          return canvas;
        },
        ratio: 1
      }),
      opacity: 0.7,
      zIndex: 3,
      properties: {
        title: 'Smoke Overlay',
        type: 'smoke-overlay'
      }
    });

    this.layersMap.set('smoke-overlay', smokeLayer);
    map.addLayer(smokeLayer);

    // Refresh when data changes
    this.fireDataSubject.subscribe(() => {
      smokeLayer.getSource()?.refresh();
    });

    return smokeLayer;
  }

  private renderSmokeOverlay(canvas: HTMLCanvasElement, extent: number[], size: number[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fireData = this.fireDataSubject.getValue();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fireData.forEach(fire => {
      if (!fire.smokeIntensity || fire.smokeIntensity <= 0) return;

      const coords = fromLonLat([fire.longitude, fire.latitude]);

      // Convert geo coords to canvas position
      const x = ((coords[0] - extent[0]) / (extent[2] - extent[0])) * size[0];
      const y = ((extent[3] - coords[1]) / (extent[3] - extent[1])) * size[1];

      // Draw smoke
      const smokeSize = fire.smokeIntensity * 200;
      const direction = fire.smokeDirection || 0;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, smokeSize);
      gradient.addColorStop(0, 'rgba(100, 100, 100, 0.8)');
      gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((direction * Math.PI) / 180);
      ctx.scale(1.5, 1); // Make smoke elliptical

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, smokeSize, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
    });
  }

  // Style methods
  private getFireIconStyle(feature: Feature): Style {
    const properties = feature.get('properties');
    if (!properties) return new Style();

    const intensity = properties.intensity || 50;
    const status = properties.status || 'active';

    // Generate a cache key based on fire properties
    const cacheKey = `${intensity}-${status}`;

    // Return cached style if exists
    if (this.fireIconCache.has(cacheKey)) {
      return this.fireIconCache.get(cacheKey)!;
    }

    // Create new style based on fire properties
    let style: Style;

    if (status === 'active') {
      // Use flame icon for active fires
      style = new Style({
        image: new Icon({
          src: 'assets/icons/flame.png',
          scale: 0.5 + (intensity / 100) * 0.5,
          opacity: 0.8
        })
      });
    } else if (status === 'contained') {
      // Use circle with different color for contained fires
      style = new Style({
        image: new CircleStyle({
          radius: 6 + (intensity / 20),
          fill: new Fill({
            color: 'rgba(255, 153, 0, 0.8)'
          }),
          stroke: new Stroke({
            color: 'black',
            width: 1
          })
        })
      });
    } else {
      // Default style
      style = new Style({
        image: new CircleStyle({
          radius: 6 + (intensity / 20),
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.8)'
          }),
          stroke: new Stroke({
            color: 'black',
            width: 1
          })
        })
      });
    }

    // Cache the style
    this.fireIconCache.set(cacheKey, style);

    return style;
  }

  private getClusterStyle(size: number, avgIntensity: number): Style {
    // Calculate color based on intensity
    const r = Math.min(255, 100 + avgIntensity * 1.5);
    const g = Math.max(0, 150 - avgIntensity);
    const b = 0;

    return new Style({
      image: new CircleStyle({
        radius: 10 + Math.min(size, 20) * 0.5,
        fill: new Fill({
          color: `rgba(${r}, ${g}, ${b}, 0.8)`
        }),
        stroke: new Stroke({
          color: 'white',
          width: 2
        })
      }),
      text: {
        text: size.toString(),
        fill: new Fill({
          color: '#fff'
        }),
        offsetY: 1
      }
    });
  }

  // Layer toggling methods
  toggleLayer(layerType: string, visible: boolean): void {
    const layer = this.layersMap.get(layerType);
    if (layer) {
      layer.setVisible(visible);
    }
  }

  // Interaction methods
  setupFireInteractions(map: Map): void {
    const select = new Select({
      condition: click,
      layers: [this.layersMap.get('fire-points')],
      style: (feature) => {
        // Style for selected fire point
        return new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({
              color: 'rgba(255, 255, 0, 0.5)'
            }),
            stroke: new Stroke({
              color: 'white',
              width: 2
            })
          })
        });
      }
    });

    map.addInteraction(select);

    // Handle selection change
    select.on('select', (e) => {
      if (e.selected.length > 0) {
        const feature = e.selected[0];
        const properties = feature.get('properties');
        if (properties) {
          this.showFireInfo(properties, map);
        }
      }
    });
  }

  private showFireInfo(fireData: FireData, map: Map): void {
    // This method would create/update a popup or infobox
    // with the fire information
    console.log('Fire information:', fireData);

    // Here you would implement popup logic
    // This is just a placeholder
  }

  // Utility methods for Legend
  getLegendItems(): Array<{color: string, label: string}> {
    return [
      { color: 'rgba(255, 0, 0, 0.8)', label: 'Active Fire' },
      { color: 'rgba(255, 153, 0, 0.8)', label: 'Contained Fire' },
      { color: 'rgba(100, 100, 100, 0.8)', label: 'Smoke' }
    ];
  }

  // Clean up methods
  destroy(): void {
    this.dispose(); // Use common cleanup logic
    this.fireDataSubject.complete();
    // Fix Map.clear issues
    this.fireIconCache.clear();
    this.layersMap.clear();
    this.layerSubscriptions.clear();
    this.styleCache.clear();
  }

  dispose(): void {
    // Clean up all subscriptions at once
    this.subscriptions.unsubscribe();

    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
      this.realtimeSub = undefined;
    }

    // Cleanup layer subscriptions - fix Map.forEach issues
    Array.from(this.layerSubscriptions.values()).forEach(sub => {
      sub.unsubscribe();
    });
    this.layerSubscriptions.clear();

    // Remove layers from map
    if (this.map) {
      Array.from(this.layersMap.values()).forEach(layer => {
        if (layer) this.map!.removeLayer(layer);
      });
      this.map = undefined;
    }

    // Complete subjects
    this._loading$.complete();
    this._error$.complete();
    this._stats$.complete();
  }

  /* =========================================================
   *               private implementation details
   * =======================================================*/

  private buildHeatmapLayer(): HeatmapLayer {
    const source = new VectorSource({});
    return new HeatmapLayer({
      source,
      blur: 15,
      radius: this.opts.heatmapRadius,
      weight: (f) => f.get('intensity') ?? 1,
    });
  }

  private buildIconLayer(): WebGLVectorLayer {
    const clustered = new Cluster({
      source: new VectorSource(),
      distance: 40,
    });

    return new WebGLVectorLayer({
      source: clustered,
      style: (f, res) => this.iconStyle(f, res),
    });
  }

  private buildSmokeLayer(): ImageLayer {
    // Placeholder – replace with your own raster or tiled smoke overlay
    return new ImageLayer({
      opacity: this.opts.smokeOpacity,
      source: undefined as any, // TODO: hook up RasterSource or XYZ
    });
  }

  /* ---- icon style ---- */
  private iconStyle(feature: Feature, resolution: number, scaleFn?: (r: number) => number) {
    // TODO: cache icon instances; simple dynamic scale example
    const scale = scaleFn ? scaleFn(resolution) : Math.max(0.6, 1.8 - Math.log(resolution));
    return {
      'circle-radius': 8 * scale,
      'circle-fill-color': '#ff6d00',
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 1.5,
    } as any; // WebGL style spec object
  }

  /* Helper method to convert FireData to OpenLayers Features */
  private convertFireDataToFeatures(fireData: FireData[]): Feature[] {
    return fireData.map(fire => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([fire.longitude, fire.latitude])),
        properties: { ...fire }
      });
      feature.setId(fire.id);
      return feature;
    });
  }

  /* ---- data helpers ---- */
  private upsertFeatures(newFeats: Feature[]): void {
    // Efficiently add/update/remove without discarding sources
    const vectorSrc = (this.iconLayer!.getSource() as Cluster).getSource();
    const existingIds = new Set(vectorSrc.getFeatures().map(f => f.getId()));

    // Remove stale
    vectorSrc.getFeatures().forEach(f => {
      if (!newFeats.find(nf => nf.getId() === f.getId())) {
        vectorSrc.removeFeature(f);
      }
    });

    // Add / replace
    newFeats.forEach(nf => {
      const id = nf.getId();
      const existing = id ? vectorSrc.getFeatureById(id) : undefined;
      if (existing) {
        existing.setProperties(nf.getProperties());
      } else {
        vectorSrc.addFeature(nf);
      }
    });

    // Mirror to heatmap source too
    const heatSrc = this.heatLayer!.getSource() as VectorSource;
    heatSrc.clear(true);
    heatSrc.addFeatures(newFeats);
  }

  /* Helper methods for layer updates */
  private updateLayerFeatures(source: VectorSource, fireData: FireData[]): void {
    // Preserve selection state
    const selectedFeatures = source.getFeatures()
      .filter(f => f.get('selected'))
      .map(f => f.getId());

    source.clear();

    const features = fireData.map(fire => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([fire.longitude, fire.latitude])),
        properties: { ...fire }
      });
      feature.setId(fire.id);

      // Restore selection state
      if (selectedFeatures.includes(fire.id)) {
        feature.set('selected', true);
      }

      return feature;
    });

    source.addFeatures(features);
  }

  // Performance optimization for style caching
  private styleCache = new Map<string, any>();

  private getStyleFromCache(key: string, generator: () => any): any {
    if (!this.styleCache.has(key)) {
      this.styleCache.set(key, generator());
    }
    return this.styleCache.get(key);
  }
}


