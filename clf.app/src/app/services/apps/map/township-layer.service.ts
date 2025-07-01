import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, BehaviorSubject, shareReplay } from 'rxjs';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import { Style, Fill, Stroke } from 'ol/style';
import { GeoJSON } from 'ol/format';
import { Geometry, MultiPolygon, Polygon } from 'ol/geom';
import { toContext } from 'ol/render';

export interface Township {
  id: string;
  name: string;
  mmName: string;
  srName: string;
  srMmName: string;
  dtName: string;
  dtMmName: string;
  geometry: any;
  properties: any;
}

export interface TownshipIndex {
  [key: string]: Township;
}

@Injectable({
  providedIn: 'root'
})
export class TownshipLayerService {
  private townshipSource: VectorSource<Feature<Geometry>> | null = null;
  private townshipLayer: VectorLayer<VectorSource<Feature<Geometry>>> | null = null;
  private townships: Township[] = [];
  private townshipIndex: TownshipIndex = {};
  private loadedFeatures: Set<string> = new Set();
  private isInitialized = false;
  
  // Observable for loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Cache for loaded data
  private dataCache: any = null;

  constructor(private http: HttpClient) {}

  /**
   * Initialize the service - loads metadata and creates empty layer
   * Does NOT load the full GeoJSON file
   */
  initialize(): Observable<void> {
    if (this.isInitialized) {
      return of(void 0);
    }

    this.loadingSubject.next(true);
    console.log('TownshipLayerService: Initializing township layer (lazy loading)');

    return this.http.get<any>('assets/geojson/mm_tsadmbnd_odi_py.geojson').pipe(
      map(data => {
        console.log('TownshipLayerService: Metadata loaded, creating index');
        
        // Create township index for fast lookup
        this.townships = data.features.map((feature: any) => ({
          id: feature.properties.ts_pcode,
          name: feature.properties.ts_eng,
          mmName: feature.properties.ts_mya,
          srName: feature.properties.sr_eng,
          srMmName: feature.properties.sr_mya,
          dtName: feature.properties.dt_eng,
          dtMmName: feature.properties.dt_mya,
          geometry: feature.geometry,
          properties: feature.properties
        }));

        // Create index for fast lookup by name and id
        this.townships.forEach(township => {
          this.townshipIndex[township.name.toLowerCase()] = township;
          this.townshipIndex[township.mmName] = township;
          this.townshipIndex[township.id] = township;
        });

        // Cache the full data for later use
        this.dataCache = data;

        // Create empty vector source
        this.townshipSource = new VectorSource();

        // Create layer with empty source
        this.townshipLayer = new VectorLayer({
          source: this.townshipSource,
          style: this.createAdm3VectorLayerStyle("#FF4500", 'rgba(0, 0, 0, 0)'),
          updateWhileAnimating: true,
          updateWhileInteracting: true,
          zIndex: 1000
        });

        this.isInitialized = true;
        this.loadingSubject.next(false);
        console.log('TownshipLayerService: Initialization complete. Townships indexed:', this.townships.length);
      }),
      shareReplay(1)
    );
  }

  /**
   * Load specific township features by names
   * Only loads the features that are needed
   */
  loadTownshipFeatures(townshipNames: string[]): void {
    if (!this.isInitialized || !this.townshipSource) {
      console.warn('TownshipLayerService: Not initialized');
      return;
    }

    try {
      const featuresToLoad: Feature<Geometry>[] = [];

      townshipNames.forEach(name => {
        const township = this.findTownshipByName(name);
        if (township && !this.loadedFeatures.has(township.id)) {
          // Create feature directly from township object
          const feature = this.createFeatureFromTownship(township);
          featuresToLoad.push(feature);
          this.loadedFeatures.add(township.id);
        }
      });

      if (featuresToLoad.length > 0) {
        this.townshipSource!.addFeatures(featuresToLoad);
        console.log(`TownshipLayerService: Loaded ${featuresToLoad.length} township features`);
      }
    } catch (error) {
      console.error('TownshipLayerService: Error loading township features:', error);
    }
  }

  /**
   * Load township features by bounding box (for viewport-based loading)
   */
  loadTownshipsInExtent(extent: number[]): void {
    if (!this.isInitialized || !this.dataCache) {
      return;
    }

    try {
      const featuresToLoad: Feature<Geometry>[] = [];
      
      // Filter features by extent (simplified - in production you might want more sophisticated filtering)
      this.townships.forEach(township => {
        if (!this.loadedFeatures.has(township.id)) {
          const feature = this.createFeatureFromTownship(township);
          featuresToLoad.push(feature);
          this.loadedFeatures.add(township.id);
        }
      });

      if (featuresToLoad.length > 0) {
        this.townshipSource!.addFeatures(featuresToLoad);
        console.log(`TownshipLayerService: Loaded ${featuresToLoad.length} township features in extent`);
      }
    } catch (error) {
      console.error('TownshipLayerService: Error loading townships in extent:', error);
    }
  }

  /**
   * Create an OpenLayers feature from a township object
   */
  private createFeatureFromTownship(township: Township): Feature<Geometry> {
    
    const feature = new Feature({
      geometry: new MultiPolygon(township.geometry.coordinates),
    });
    
    // Set additional properties
    feature.setId(township.id);
    feature.set('name', township.name);
    feature.set('mmName', township.mmName);
    feature.set('srName', township.srName);
    feature.set('srMmName', township.srMmName);
    feature.set('dtName', township.dtName);
    feature.set('dtMmName', township.dtMmName);
    
    return feature;
  }

  /**
   * Find township by name (case-insensitive)
   */
  findTownshipByName(name: string): Township | undefined {
    const normalizedName = name.toLowerCase();
    return this.townshipIndex[normalizedName];
  }

  /**
   * Find township by ID
   */
  findTownshipById(id: string): Township | undefined {
    return this.townshipIndex[id];
  }

  /**
   * Get all loaded township names
   */
  getLoadedTownshipNames(): string[] {
    return Array.from(this.loadedFeatures).map(id => {
      const township = this.findTownshipById(id);
      return township?.name || '';
    }).filter(name => name);
  }

  /**
   * Highlight specific township
   */
  highlightTownship(township: Township): void {
    if (!this.townshipSource) return;

    // Ensure the township feature is loaded
    if (!this.loadedFeatures.has(township.id)) {
      this.loadTownshipFeatures([township.name]);
    }

    const feature = this.townshipSource.getFeatureById(township.id);
    if (feature) {
      feature.setStyle(new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.3)'
        }),
        stroke: new Stroke({
          color: '#ff0000',
          width: 1
        })
      }));
    }
  }

  /**
   * Highlight multiple townships
   */
  highlightTownships(townships: Township[]): void {
    if (!this.townshipSource) return;

    const townshipNames = townships.map(t => t.name);
    this.loadTownshipFeatures(townshipNames);
    townships.forEach(township => {
      const feature = this.townshipSource!.getFeatureById(township.id);
      if (feature) {
        feature.setStyle(new Style({
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.3)'
          }),
          stroke: new Stroke({
            color: '#ff0000',
            width: 1
          })
        }));
      }
    });
  }

  /**
   * Reset all highlights
   */
  resetHighlight(): void {
    if (!this.townshipSource) return;
    
    this.townshipSource.getFeatures().forEach(feature => {
      feature.setStyle(new Style({
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)'
        }),
        stroke: new Stroke({
          color: '#FF4500',
          width: 1
        })
      }));
    });
  }

  /**
   * Clear all loaded features
   */
  clearFeatures(): void {
    if (this.townshipSource) {
      this.townshipSource.clear();
      this.loadedFeatures.clear();
    }
  }

  /**
   * Get the layer
   */
  getLayer(): VectorLayer<VectorSource<Feature<Geometry>>> | null {
    return this.townshipLayer;
  }

  /**
   * Get township statistics
   */
  getStats(): { total: number; loaded: number; cached: boolean } {
    return {
      total: this.townships.length,
      loaded: this.loadedFeatures.size,
      cached: this.dataCache !== null
    };
  }

  private createAdm3VectorLayerStyle(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {
    const customRenderer = (pixelCoordinates: any, state: any) => {
      const ctx = state.context as CanvasRenderingContext2D;

      // Reproject the geometry into pixel space:
      const geom = state.geometry.clone();
      geom.setCoordinates(pixelCoordinates);

      // Set up fill and stroke styles
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;

      // First pass: Draw the outline of all polygons
      ctx.save();
      const renderCtx = toContext(ctx, { pixelRatio: 1 });
      renderCtx.setFillStrokeStyle(
        state.fillStyle,
        new Stroke({ color: strokeColor, width: 1 })
      );
      renderCtx.drawGeometry(geom);
      ctx.restore();
    }

    return [new Style({
      renderer: customRenderer
    })];
  }
}