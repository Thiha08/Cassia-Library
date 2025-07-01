import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, HostBinding, HostListener, NgZone, Renderer2, ViewChild } from "@angular/core";
import GeoJSON from "ol/format/GeoJSON";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from 'ol/Map';
import { OSM, XYZ } from "ol/source";
import VectorSource from "ol/source/Vector";
import { MaterialModule } from 'src/app/material.module';
import View from "ol/View";
import { fromLonLat, toLonLat } from "ol/proj";
import { buffer, Extent, getBottomLeft, getCenter, getHeight, getTopRight, getWidth } from "ol/extent";
import { LineString, MultiPolygon, Point, Polygon, SimpleGeometry } from "ol/geom";
import Feature, { FeatureLike } from "ol/Feature";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { fromExtent } from "ol/geom/Polygon";
import VectorImageLayer from "ol/layer/VectorImage";
import VectorTileLayer from "ol/layer/VectorTile";
import { apply } from "ol-mapbox-style";
import CloudControl from './cloud.control';
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";
import { containsCoordinate, getCenter as extentGetCenter } from "ol/extent";
import Icon from "ol/style/Icon";
import { VectorTile, WebGLPoints } from "ol/layer";
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { LongPressEvent, LongPressInteraction } from "./long-press.interaction";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { HttpClient } from '@angular/common/http';
import Heatmap from 'ol/layer/Heatmap';
import { Observable } from "rxjs";
import { AppWeeklyStatsComponent } from "../../../components/dashboard1/weekly-stats/weekly-stats.component";
import Overlay from "ol/Overlay";
import { Coordinate, toStringHDMS } from "ol/coordinate";
import { MatDialog } from "@angular/material/dialog";
import { WikiDialogComponent } from "./wiki-dialog.component";
import { MYANMAR_CITIES } from "./myanmar-cities";
import { CityStatsDialogComponent } from "./city-stats-dialog.component";
import { TablerIconsModule } from "angular-tabler-icons";
import TimelineControl from "./timeline.control";
import { NgApexchartsModule } from "ng-apexcharts";
import { NgScrollbarModule } from "ngx-scrollbar";
import { MapLayersService } from "../../../services/apps/map/map-layers.service";
import CircleStyle from "ol/style/Circle";
import { getVectorContext, toContext } from "ol/render";
import { unByKey } from "ol/Observable";
import Polyline from 'ol/format/Polyline';
import { Zoom } from "ol/control";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { CardOpts, CircleOpts, CustomRenderer, SquareOpts } from "./custom-renderer";
import { RenderFunction } from "ol/style/Style";
import { WebGLStyle } from "ol/style/webgl";
interface EarthquakeData {
  features: Array<{
    properties: {
      mag: number;
      place: string;
      time: number;
      title: string;
    },
    geometry: {
      coordinates: number[]
    }
  }>;
  metadata: {
    generated: number;
    count: number;
    title: string;
  };
}

interface stats {
  id: number;
  time: string;
  color: string;
  title?: string;
  subtext?: string;
  link?: string;
}



@Component({
  selector: 'app-mapboard6',
  imports: [
    MaterialModule,
    TablerIconsModule,
    NgApexchartsModule,
    NgScrollbarModule
  ],
  templateUrl: './mapboard6.component.html',
  styleUrls: ['./mapboard6.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slidePanel', [
      state('hidden', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('hidden <=> visible', animate('500ms ease')),
    ]),
  ],
})
export class AppMapboard6Component implements AfterViewInit {

  listenerKey: any;
  private routeLayer: VectorLayer;
  private routeSource: VectorSource;

  private cityLayer: VectorLayer;
  private citySource: VectorSource;
  selectedCity: any;

  private newsLayer: VectorLayer;
  private newsSource: VectorSource;
  private selectedNews: any;

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

  /** 2️⃣ Cache a single Style per type */
  private newsStyleCache: Record<string, Style> = {};



  // Animation controls
  speed = 0.2;            // Default speed (units: coordinate fraction per second)
  animating = false;
  distance = 0;
  lastFrameTime = 0;
  routeLoaded = false;  // Flag to track if route is loaded

  // Features and geometry
  routeFeature!: Feature;
  startMarker!: Feature;
  endMarker!: Feature;
  geoMarker!: Feature;
  routeGeom!: any;
  position!: Point;

  stats: stats[] = [
    {
      id: 1,
      time: '01 APRIL',
      color: 'primary',

    },
    {
      id: 2,
      time: '02 APRIL',
      color: 'accent',

    },
    {
      id: 3,
      time: '03 APRIL',
      color: 'success',

    },
    {
      id: 1,
      time: '04 APRIL',
      color: 'primary',

    },
    {
      id: 2,
      time: '05 APRIL',
      color: 'accent',

    },
    {
      id: 3,
      time: '06 APRIL',
      color: 'success',

    },
    {
      id: 4,
      time: '07 APRIL',
      color: 'warning',

    },
    {
      id: 5,
      time: '08 APRIL',
      color: 'error',
    },
    {
      id: 6,
      time: '09 APRIL',
      color: 'success',
    },
    {
      id: 7,
      time: '10 APRIL',
      color: 'success',
    },
    {
      id: 8,
      time: '11 APRIL',
      color: 'primary',

    },
    {
      id: 9,
      time: '12 APRIL',
      color: 'accent',

    },
    {
      id: 10,
      time: '13 APRIL',
      color: 'success',

    },
    {
      id: 11,
      time: '14 APRIL',
      color: 'warning',

    },
    {
      id: 12,
      time: '15 APRIL',
      color: 'error',
    },
    {
      id: 13,
      time: '16 APRIL',
      color: 'success',
    },
    {
      id: 14,
      time: '17 APRIL',
      color: 'success',
    },
    {
      id: 1,
      time: '18 APRIL',
      color: 'primary',

    },
    {
      id: 2,
      time: '19 APRIL',
      color: 'accent',

    },
    {
      id: 3,
      time: '20 APRIL',
      color: 'success',

    },
    {
      id: 4,
      time: '21 APRIL',
      color: 'warning',

    },
    {
      id: 5,
      time: '22 APRIL',
      color: 'error',
    },
    {
      id: 6,
      time: '23 APRIL',
      color: 'success',
    },
    {
      id: 7,
      time: '24 APRIL',
      color: 'success',
    },
    {
      id: 8,
      time: '25 APRIL',
      color: 'primary',

    },
    {
      id: 9,
      time: '26 APRIL',
      color: 'accent',

    },
    {
      id: 10,
      time: '27 APRIL',
      color: 'success',

    },
    {
      id: 11,
      time: '28 APRIL',
      color: 'warning',

    },
    {
      id: 12,
      time: '29 APRIL',
      color: 'error',
    },
    {
      id: 13,
      time: '30 APRIL',
      color: 'success',
    },
    {
      id: 14,
      time: '31 APRIL',
      color: 'success',
    },
  ];

  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  @ViewChild('markerElement', { static: true }) markerElement!: ElementRef;

  @ViewChild('viennaElement', { static: true }) viennaElement!: ElementRef;

  @ViewChild('popupContainer', { static: true }) popupContainer!: ElementRef;

  @ViewChild('popupContent', { static: true }) popupContent!: ElementRef;

 /* @ViewChild('popupCloser', { static: true }) popupCloser!: ElementRef;*/

  /*  @ViewChild('staticOverlayContent', { static: true }) staticOverlayContent!: ElementRef;*/

  private timelineControl: TimelineControl;

  private map!: Map;

  private townshipOverlay: Overlay;

  private clockLayer: WebGLVectorLayer;

  private clockSource: VectorSource;

  private animStart = 0;

  private animReq: number | null = null;

  private earthquakeSource = new VectorSource();
  private earthquakeLayer: VectorLayer;
  private earthquakeHeatmapLayer: Heatmap;
  private showHeatmap = false; // Toggle between heatmap and vector points

  // cache style objects
  private routeStyle = new Style({ stroke: new Stroke({ color: [237, 212, 0, 0.8], width: 6 }) });
  private iconStyle = new Style({ image: new Icon({ anchor: [0.5, 1], src: 'assets/icons/icon-128x128.png', scale: 0.5 }) });
  private markerStyle = new Style({ image: new CircleStyle({ radius: 7, fill: new Fill({ color: 'black' }), stroke: new Stroke({ color: 'white', width: 2 }) }) });


  // Normal township style (you probably already have something like this)
  private normalStyle = new Style({
    fill: new Fill({ color: 'rgba(57,139,247,0.2)' }),
    stroke: new Stroke({ color: '#398bf7', width: 1 })
  });

  // CK3‑style “alert” highlight
  private alertStyle = new Style({
    fill: new Fill({ color: 'rgba(255, 69, 0, 0.15)' }),            // translucent orange
    stroke: new Stroke({
      color: '#FF4500',      // bright alert orange
      width: 3,
      lineDash: [8, 6],      // dashed border
      lineCap: 'butt'
    })
  });

  private cityStyle = new Style({ image: new Icon({ anchor: [0.5, 1], src: 'assets/icons/city-square.svg', scale: 0.5 }) });

  // to track timeline visibility
  showTimeline = false;

  // Reference to OpenLayers Zoom control
  private zoomControl: Zoom;

  private zoomListenerKey!: any;

  constructor(
    private dialog: MatDialog,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private http: HttpClient,
    private mapLayersService: MapLayersService,
    private cd: ChangeDetectorRef
  ) {
    // Now subscribe to future changes
    this.subscribeToStyleChanges();
    this.subscribeToLayerChanges();
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initializeMap();
      this.startAnimation();
    });
  }

  private routeStyles: Record<string, Style> = {
    route: new Style({
      stroke: new Stroke({ width: 6, color: [237, 212, 0, 0.8] }),
    }),
    icon: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'assets/icons/icon-128x128.png',
        scale: 0.01,
      }),
    }),
    geoMarker: new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'black' }),
        stroke: new Stroke({ color: 'white', width: 2 }),
      }),
    }),
  };

  private getRouteVectorLayer(): VectorLayer<VectorSource> {
    // 1) Create the VectorSource with URL+format
    const routeSource = new VectorSource({
      url: 'assets/routes/mdy_pol_route.geojson',
      format: new GeoJSON(),
    });

    // 2) Build the layer now (with just the route in it)
    const layer = new VectorLayer({
      source: routeSource,
      style: (feature, resolution) => this.getDynamicStyle(feature, resolution),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      declutter: true,
      zIndex: 10000,
    });

    // 3) Once the first feature is added, GeoJSON is loaded and parsed
    routeSource.once('addfeature', () => {
      const features = routeSource.getFeatures();
      if (!features.length) return;

      // 4) Pull out your LineString geometry
      const routeFeature = features[0];
      const routeGeom = routeFeature.getGeometry() as LineString;

      // 5) Now you can safely create your start/end/geo markers
      const routeMaker = new Feature({
        type: 'route',
        geometry: routeGeom,
      });
      const startMarker = new Feature({
        type: 'icon',
        geometry: new Point(routeGeom.getFirstCoordinate()),
      });
      const endMarker = new Feature({
        type: 'icon',
        geometry: new Point(routeGeom.getLastCoordinate()),
      });
      const geoMarker = new Feature({
        type: 'geoMarker',
        geometry: new Point(routeGeom.getFirstCoordinate()),
      });

      // 6) And add them into the very same source
      routeSource.addFeatures([routeMaker, startMarker, endMarker, geoMarker]);

      // 7) Set the route geometry for later use
      this.routeGeom = routeGeom;
      this.geoMarker = geoMarker;
    });
    this.routeLayer = layer;

    return layer;
  }

  private getDynamicStyle(feature: FeatureLike, resolution: number): Style {
    const zoom = this.map.getView().getZoomForResolution(resolution)!; // converts resolution → zoom
    switch (feature.get('type')) {
      case 'route':
        // thicker lines at high zoom, thinner at low
        this.routeStyle.getStroke()!.setWidth(1 + zoom * 0.2);
        return this.routeStyle;

      case 'icon':
        // scale icons up/down with zoom
        const iconScale = 0.3 + zoom * 0.001;
        this.iconStyle.getImage()!.setScale(iconScale);
        return this.iconStyle;

      case 'geoMarker':
        // 1) Grab the image and cast it to CircleStyle
        const img = this.markerStyle.getImage();
        if (img instanceof CircleStyle) {
          img.setRadius(3 + zoom * 0.5);
        }
        return this.markerStyle;
    }
    return this.routeStyle; // fallback
  }

  private centerMapOnRoute(): void {
    if (!this.routeGeom) return;

    // Get the extent of the route
    const extent = this.routeGeom.getExtent();

    // Add some padding
    const padding = [50, 50, 50, 50]; // [top, right, bottom, left] in pixels

    // Fit the view to the route extent with padding
    this.map.getView().fit(extent, {
      padding: padding,
      maxZoom: 16,
      duration: 1000 // Smooth animation to zoom to the route
    });
  }

  private moveFeature(event: any): void {
    // 1. Use frameState.time for consistent animation timing
    const frameTime = event.frameState.time;
    const elapsed = frameTime - this.lastFrameTime;
    this.lastFrameTime = frameTime;

    // Prevent NaN or negative values causing issues
    if (isNaN(elapsed) || elapsed <= 0) {
      return;
    }

    // 2. Get the current zoom level
    const zoom = this.map.getView().getZoom() || 1; // avoid division by zero

    // 3. Compute an adjusted speed: slower at higher zoom
    //    e.g. if base speed = 0.2 units/sec, then at zoom 4, effective speed = 0.2 / 4 = 0.05
    const effectiveSpeed = this.speed / zoom;

    // 4. Advance your “distance” along the route
    this.distance = (this.distance + (effectiveSpeed * elapsed) / 1e3) % 1;

    // 5. Compute the fraction along the route (handles ping‑pong or loop logic)
    const fraction = this.distance > 0.5 ? 1 - (this.distance - 0.5) * 2 : this.distance * 2;

    const coord = this.routeGeom.getCoordinateAt(fraction);

    // Set the position of the marker
    if (this.position) {
      this.position.setCoordinates(coord);
    } else {
      this.position = new Point(coord);
    }

    const vectorContext = getVectorContext(event);
    vectorContext.setStyle(this.markerStyle);
    vectorContext.drawGeometry(this.position);

    // continue animating
    this.map.render();
  }

  toggleAnimation(): void {
    this.animating ? this.stopAnimation() : this.startAnimation();
  }

  private startAnimation(): void {

    this.animating = true;
    this.lastFrameTime = Date.now();

    // Hide the static geoMarker feature
    /*  this.geoMarker.setGeometry(undefined);*/

    // Register postrender animation outside Angular zone
    //this.ngZone.runOutsideAngular(() => {
    //  if (this.listenerKey) {
    //    unByKey(this.listenerKey);
    //  }

    //  this.listenerKey = this.routeLayer.on('postrender', (event) => this.moveFeature(event));
    //  this.map.render(); // Trigger first render
    //});
  }

  private stopAnimation(): void {
    this.animating = false;

    // Place geoMarker at current position
    if (this.geoMarker && this.position) {
      this.geoMarker.setGeometry(this.position);
    }

    // Unregister listener properly
    if (this.listenerKey) {
      unByKey(this.listenerKey);
      this.listenerKey = null;
    }
  }

  private subscribeToStyleChanges(): void {
    effect(() => {
      const styleUrl = this.mapLayersService.tileStyle$();
      if (this.map) {
        // Only the actual OpenLayers operations should run outside NgZone
        this.ngZone.runOutsideAngular(() => {
          apply(this.map, styleUrl)
        });
      }
    });
  }

  private subscribeToLayerChanges(): void {
    effect(() => {
      const layerState = this.mapLayersService.layerState$();

      // Use NgZone.run for changes that affect the UI
      this.ngZone.run(() => {
        this.toggleAnimation();
        // Set visibility for earth layer (terrain/base)
        //const earthLayers = this.getEarthLayerGroup();
        //earthLayers.setVisible(layerState.earth);

        //// Set visibility for water layer
        //const waterLayers = this.getWaterLayerGroup();
        //waterLayers.setVisible(layerState.water);

        //// Set visibility for air layer
        //const airLayers = this.getAirLayerGroup();
        //airLayers.setVisible(layerState.air);

        //// Set visibility for fire layer
        //const fireLayers = this.getFireLayerGroup();
        //fireLayers.setVisible(layerState.fire);

        //// Set visibility for war layer
        //const warLayers = this.getWarLayerGroup();
        //warLayers.setVisible(layerState.war);

      });
    });
  }

  resetAnimation(): void {
    this.stopAnimation();
    this.distance = 0;

    // Reset position to start of route
    if (this.routeGeom) {
      this.position = new Point(this.routeGeom.getFirstCoordinate());
      this.geoMarker.setGeometry(this.position);
    }

    this.map.render();
  }

  // Helper methods to get layer groups
  // These are placeholder methods - update them to match your actual OpenLayers layer structure
  private getEarthLayerGroup(): any {
    // Return the base/terrain layer group
    // For example: return this.map.getLayers().getArray().find(l => l.get('name') === 'earth');
    return this.getAdm3VectorLayer(); // Example replacement
  }

  private getWaterLayerGroup(): any {
    // Return water-related layers
    return this.getTownVectorLayer(); // Example replacement
  }

  private getAirLayerGroup(): any {
    // Return air/atmosphere-related layers
    return this.getEarthquakeHeatmapLayer(); // Example replacement
  }

  private getFireLayerGroup(): any {
    // Return fire/heat-related layers
    return this.clockLayer; // Example replacement
  }

  private getWarLayerGroup(): any {
    // Return battle/conflict layers 
    // This could be a placeholder empty layer if you don't have one yet
    // For now we'll return a dummy layer or one of the existing layers
    return this.getAdm0VectorLayer(); // Example replacement
  }

  private addTimelineControl(): void {
    // Create timeline control with appropriate date range
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1); // 6 months ago
    const endDate = new Date(now.getFullYear(), now.getMonth() + 6, 0);  // 6 months ahead

    this.timelineControl = new TimelineControl({
      position: 'right',
      startDate: startDate,
      endDate: endDate,
      currentDate: now,
      /*onDateChange: (date) => this.handleTimelineChange(date)*/
    });

    // Add the control to the map
    this.map.addControl(this.timelineControl);
  }

  private handleTimelineChange(date: Date): void {
    // Here you can update your map data based on the selected date
    console.log('Timeline date changed:', date);

    // For example, you might want to filter features based on the date
    // Or load new data for the selected timeframe

    // Force map redraw
    this.map.render();
  }

  private getTownshipOverlay(): Overlay {
    this.townshipOverlay = new Overlay({
      element: this.popupContainer.nativeElement,
      autoPan: {
        animation: {
          duration: 250
        }
      }
    });

    return this.townshipOverlay;
  }

  private initializeMap(): void {

    

    //// Add a click handler to hide the popup.
    //this.popupCloser.nativeElement.onclick = () => {
    //  this.overlay.setPosition(undefined);
    //  this.popupCloser.nativeElement.blur();
    //  return false;
    //};


    // Define Myanmar extent with padding to limit map view
    const myanmarExtent: Extent = [
      ...fromLonLat([88.0, 3.0]),   // lower-left corner
      ...fromLonLat([108.0, 36.0])  // upper-right corner
    ];
    const degreePadding = 20.0;

    const starStyle = new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.6)'
      }),
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 1)',
        width: 2
      })
    });

    // Create a VectorSource + VectorLayer to store "stars"
    const timeVectorSource = new VectorSource();
    const timeVectorLayer = new VectorLayer({
      source: timeVectorSource,
      zIndex: 1000,
      style: starStyle
      // style: some style for the star if you like
    });

    /*this.clockLayer = this.getClockVectorLayer();*/

    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        /*timeVectorLayer,*/
        /* this.getBase2TileLayer(),*/
       /* this.getAdm0VectorLayer(),*/
       /* this.getEcoregionsWebGLVectorLayer(),*/
        //this.getAdm1VectorLayer(),
        //this.getAdm2VectorLayer(),
        /* this.getMapVectorTileLayer(),*/
        this.getAdm3VectorLayer(),
        /*this.getTownVectorLayer(),*/
        //this.getEarthquakeHeatmapLayer(),
        this.getRouteVectorLayer(),
        //this.clockLayer
        this.getNewsVectorLayer(),
        this.getCityVectorLayer(),
      ],
      overlays: [this.getTownshipOverlay()],
      view: new View({
        center: getCenter(myanmarExtent),
        zoom: 4.5,
        minZoom: 4,
        maxZoom: 19,
        enableRotation: false,
        extent: buffer(myanmarExtent, degreePadding / 2) // Limit draggable area but still give some freedom
      })
    });

    /*this.applyStyle(this.map, this.mapLayersService.tileStyleSignal());*/

    /* apply(this.map, 'assets/geolayers/mapart.json');*/

    //// Add our custom Cloud control
    //const cloudControl = new CloudControl({
    //  opacity: 0.7,
    //  density: 0.5,
    //  windAngle: Math.PI / 2,
    //  windSpeed: 1.0
    //  // Optionally override default images with: img: new Image(), bird: new Image(), etc.
    //});
    //this.map.addControl(cloudControl);

    // Create our LongPressInteraction
    const longPress = new LongPressInteraction({
      holdDuration: 2000,          // 2 seconds
      maxMovement: 5,             // 5 pixels tolerance
      vectorSource: timeVectorSource,
      mapProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326' // if you want to store coords in lat/lon
    });

    // Add the custom interactions

    this.map.addInteraction(longPress);

    this.addTimelineControl();

    this.setupCityClick();

    //// Listen for the custom 'longpress' event:
    //longPress.on('longpress', (evt: LongPressEvent) => {
    //  const coord = evt.coordinate;
    //  this.addClockFeature(coord);
    //});

    // Coordinate for Vienna
    const pos = fromLonLat([16.3725, 48.208889]);

    // Marker overlay
    const markerOverlay = new Overlay({
      position: pos,
      positioning: 'center-center',
      element: this.markerElement.nativeElement,
      stopEvent: false,
    });
    this.map.addOverlay(markerOverlay);

    // Vienna label overlay
    const viennaOverlay = new Overlay({
      position: pos,
      element: this.viennaElement.nativeElement,
    });
    this.map.addOverlay(viennaOverlay);

    //// Click event -> open Angular Material dialog
    //this.map.on('click', (evt) => {
    //  const coordinate = evt.coordinate;
    //  const hdms = toStringHDMS(toLonLat(coordinate)); // e.g. 48°12′32″N 16°22′21″E

    //  // Show the Wikipedia info dialog
    //  this.dialog.open(WikiDialogComponent, {
    //    width: '400px',
    //    data: {
    //      coordinate: hdms,
    //    },
    //  });
    //});

    // Create Overlays for each city
    //MYANMAR_CITIES.forEach((city) => {
    //  // Create a DOM element for the city icon
    //  const cityIcon = document.createElement('div');
    //  cityIcon.className = 'city-icon';
    //  cityIcon.innerHTML = '★'; // or use an <img> for a custom icon

    //  // Click event -> open dialog
    //  cityIcon.addEventListener('click', () => {
    //    this.dialog.open(CityStatsDialogComponent, {
    //      data: city,
    //    });
    //  });

    //  // Convert lat/lon to map projection
    //  const position = fromLonLat([city.lon, city.lat]);
    //  const cityOverlay = new Overlay({
    //    position,
    //    element: cityIcon,
    //    stopEvent: true, // ensures click on the overlay is captured
    //  });

    //  this.map.addOverlay(cityOverlay);
    //});

    // Handle map click events to display the overlay at the click position.
    this.map.on('singleclick', evt => {
      const coordinate = evt.coordinate;
      this.townshipOverlay.setPosition(coordinate);
    });

    const initialStyle = this.mapLayersService.tileStyle$();
    apply(this.map, initialStyle);

    this.zoomListenerKey = this.map
      .getView()
      .on('change:resolution', () => this.onZoomChange());
  }

  private onZoomChange() {
    this.ngZone.run(() => {
      const zoom = this.map.getView().getZoom() ?? 0;
      const needTimline = zoom >= 12;
      if (this.showTimeline != needTimline) {
        this.showTimeline = needTimline;
        console.log('showTimeline:', this.showTimeline);
        this.cd.detectChanges();
      }
    });
  }

  // Method to close the popup overlay
  closePopup(event: Event): boolean {
    event.preventDefault();
    this.townshipOverlay.setPosition(undefined);
    return false;
  }

  private getBaseTileLayer(): TileLayer {

    const layer = new TileLayer({
      source: new OSM(),
      minZoom: 10, // Only visible when zoomed in very close
      zIndex: 10
    });

    return layer;
  }

  private getBase1TileLayer(): TileLayer {

    const layer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg",
        attributions: ['&copy; <a href="http://www.arcgis.com/home/">Esri</a> ',
          '&copy; <a href="http://www.arcgis.com/home/">DigitalGlobe, Earthstar Geographics, CNES/Airbus DS, GeoEye, USDA FSA, USGS, Getmapping, Aerogrid, IGN, IGP, swisstopo</a> '
        ]
      }),
      /* minZoom: 10, // Only visible when zoomed in very close*/
      zIndex: 10
    });

    return layer;
  }

  private getMapVectorTileLayer(): VectorTileLayer {

    const layer = new VectorTileLayer({
      source: new VectorTileSource({
        url: 'https://tiles.openfreemap.org/planet/20250312_001001_pt/{z}/{x}/{y}.pbf',
        format: new MVT()
      }),
      zIndex: 1000,
    });
    return layer;
  }

  private getEcoregionsWebGLVectorLayer(): WebGLVectorLayer {
    const layer = new WebGLVectorLayer({
      source: new VectorSource({
        url: 'https://openlayers.org/data/vector/ecoregions.json',
        format: new GeoJSON(),
      }),
      style: this.createEcoregionVectorLayerStyle(),
      zIndex: 1000000,
    });

    return layer;
  }

  private getEcoregionsVectorLayer(): WebGLVectorLayer {
    const layer = new WebGLVectorLayer({
      source: new VectorSource({
        url: 'https://openlayers.org/data/vector/ecoregions.json',
        format: new GeoJSON(),
      }),
      style: this.createEcoregionVectorLayerStyle(),
      zIndex: 1000000,
    });

    return layer;
  }

  private getAdm0VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM0_simplified.geojson',
        format: new GeoJSON()
      }),
      style: this.createAdm0VectorLayerStyle("#FF5722", "rgba(255,87,34,0.2)"),
      //minZoom: 0,
      //maxZoom: 8,
      zIndex: 2000000,
    });
    return layer;
  }

  private getAdm1VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM1_simplified.geojson',
        format: new GeoJSON()
      }),
      style: this.createAdm1VectorLayerStyle("#398bf7", "#141A21"),
      minZoom: 6,
      zIndex: 90
    });
    return layer;
  }

  private getNewsVectorLayer(): VectorLayer<VectorSource> {
    // 1) Create the VectorSource with URL+format
    this.newsSource = new VectorSource({
      url: 'assets/geojson/news/april_news.geojson',
      format: new GeoJSON(),
    });

    // 2) Build the layer now (with just the route in it)
    this.newsLayer = new VectorLayer({
      source: this.newsSource,
      style: (feature, resolution) => this.getNewsStyleV2(feature, resolution),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      declutter: true,
      zIndex: 20000,
    });

    return this.newsLayer;
  }

  private getNewsStyle(feature: FeatureLike, resolution: number): Style[] {
    const zoom = this.map.getView().getZoomForResolution(resolution)!;
    const type = feature.get('type') as string;
    const ringColor = this.newsTypeColors[type] ?? '#000';
    const innerColor = ringColor;

    const outer = new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
        stroke: new Stroke({ color: ringColor, width: 3 }),
      })
    });

    outer.getImage()!.setScale(0.3 + zoom * 0.05);

    const inner = new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: innerColor }),
        stroke: new Stroke({ color: ringColor, width: 1 }),
      })
    });

    inner.getImage()!.setScale(0.3 + zoom * 0.05);

    return [outer, inner];
  }

  private getCombinedNewsStyleNew(feature: FeatureLike, resolution: number): Style {
    const zoom = this.map.getView().getZoomForResolution(resolution)!;
    const type = feature.get('type') as string;
    const ringColor = this.newsTypeColors[type] ?? '#000'; // Outer ring color
    const innerColor = ringColor; // Inner circle color

    const circleRenderer =
      (pixelCoordinates: any, state: any) => this.renderCircle(pixelCoordinates, state, type, zoom);

    const cardRenderer =
      (pixelCoordinates: any, state: any) => this.renderCard(pixelCoordinates, state);

    // Define the custom renderer with the correct typing expected by OpenLayers
    const customRenderer = function (pixelCoordinates: any, state: any) {
      const context = state.context;
      const coordinates = Array.isArray(pixelCoordinates) ?
        (Array.isArray(pixelCoordinates[0]) ? pixelCoordinates[0] : pixelCoordinates) :
        [0, 0];

      // Ensure we have valid x, y coordinates to draw on
      const x = coordinates[0];
      const y = coordinates[1];

      // Current zoom-based scaling factors
      const outerRadius = 10 * (1.5 + zoom * 0.1);
      const innerRadius = 6 * (1.5 + zoom * 0.1);



      // Draw a "card" above the point
      const cardWidth = 400;
      const cardHeight = 100;
      const cardX = x - (cardWidth / 2) + 500; // Center card horizontally
      const cardY = y - cardHeight - outerRadius - 10; // Position above the point with spacing

      // Card background (white with shadow)
      context.save();
      context.shadowColor = 'rgba(0, 0, 0, 0.3)';
      context.shadowBlur = 10;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;

      // Draw card background
      context.fillStyle = 'white';
      context.beginPath();
      context.roundRect(cardX, cardY, cardWidth, cardHeight, 8); // Rounded rectangle
      context.fill();
      context.restore(); // Remove shadow for text

      // Draw content in card
      context.fillStyle = 'black';
      context.textAlign = 'left';
      context.font = '100px';
      const description = feature.get('description') || 'No description available';
      context.fillText(description.length > 30 ? description.substring(0, 30) + '...' : description,
        cardX + 10, cardY + 40);

      // Draw indicator line from card to point
      context.beginPath();
      context.moveTo(x, y - outerRadius);
      context.lineTo(x, cardY + cardHeight);
      context.strokeStyle = ringColor;
      context.lineWidth = 10;
      context.stroke();
    };

    // Return the custom style
    return new Style({
      renderer: (pixels, state) => {
        //circleRenderer;
        //cardRenderer;
        customRenderer;
      }
    });
  }

  private getCombinedNewsStyle(feature: FeatureLike, resolution: number): Style {
    const zoom = this.map.getView().getZoomForResolution(resolution)!;
    const type = feature.get('type') as string;
    const ringColor = this.newsTypeColors[type] ?? '#000'; // Outer ring color
    const innerColor = ringColor; // Inner circle color

    // Define the custom renderer with the correct typing expected by OpenLayers
    const customRenderer = function (pixelCoordinates: any, state: any) {
      const context = state.context;
      const coordinates = Array.isArray(pixelCoordinates) ?
        (Array.isArray(pixelCoordinates[0]) ? pixelCoordinates[0] : pixelCoordinates) :
        [0, 0];

      // Ensure we have valid x, y coordinates to draw on
      const x = coordinates[0];
      const y = coordinates[1];

      // Current zoom-based scaling factors
      const outerRadius = 10 * (1.5 + zoom * 0.1);
      const innerRadius = 6 * (1.5 + zoom * 0.1); +

        // Outer circle
        context.beginPath();
      context.arc(x, y, outerRadius, 0, 2 * Math.PI);
      context.fillStyle = 'rgba(255, 255, 255, 1)'; // Outer circle fill
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = ringColor; // Outer circle stroke
      context.stroke();

      // Inner circle
      context.beginPath();
      context.arc(x, y, innerRadius, 0, 2 * Math.PI);
      context.fillStyle = innerColor; // Inner circle fill
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = ringColor; // Inner circle stroke
      context.stroke();

      // Draw a "card" above the point
      const cardWidth = 400;
      const cardHeight = 100;
      const cardX = x - (cardWidth / 2); // Center card horizontally
      const cardY = y - cardHeight - outerRadius - 10; // Position above the point with spacing

      // Card background (white with shadow)
      context.save();
      context.shadowColor = 'rgba(0, 0, 0, 0.3)';
      context.shadowBlur = 10;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;

      // Draw card background
      context.fillStyle = 'white';
      context.beginPath();
      context.roundRect(cardX, cardY, cardWidth, cardHeight, 8); // Rounded rectangle
      context.fill();
      context.restore(); // Remove shadow for text

      // Draw content in card
      context.fillStyle = 'black';
      context.textAlign = 'left';
      context.font = '35px sans-serif';
      const description = feature.get('description') || 'No description available';
      context.fillText(description.length > 30 ? description.substring(0, 30) + '...' : description,
        cardX + 10, cardY + 40);

      // Draw indicator line from card to point
      context.beginPath();
      context.moveTo(x, y - outerRadius);
      context.lineTo(x, cardY + cardHeight);
      context.strokeStyle = ringColor;
      context.lineWidth = 10;
      context.stroke();
    };

    // Return the custom style
    return new Style({
      renderer: customRenderer
    });
  }

  private getNewsStyleV2(feature: FeatureLike, resolution: number): Style {
    const zoom = this.map.getView().getZoomForResolution(resolution)!;
    const type = feature.get('type') as string;
    const ringColor = this.newsTypeColors[type] ?? '#000'; // Outer ring color
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

  //private getNewDespStyleV2(feature: FeatureLike): Style {
  //  const description = feature.get('description') || 'No description available';
  //}

  //private drawConnector(
  //  pixels: number[][],
  //  context: CanvasRenderingContext2D,
  //  feature: FeatureLike
  //) {
  //  const [x, y] = pixels[0];
  //  const { cardX, cardY } = this.getCardRect(x, y);

  //  context.save();
  //  context.beginPath();
  //  context.moveTo(x, y - this.outerRadius);
  //  context.lineTo(x, cardY + this.cardHeight);
  //  context.strokeStyle = this.ringColor;
  //  context.lineWidth = 2;
  //  context.stroke();
  //  context.restore();
  //}

  //private drawArcConnector(
  //  pixels: number[][],
  //  ctx: CanvasRenderingContext2D,
  //  width: number,
  //  height: number,
  //  radius: number
  //): void {

  //  const [x, y] = pixels[0];
  //  const { cardX, cardY } = this.getCardRect(x, y);

  //  ctx.moveTo(x + radius, y);
  //  ctx.arcTo(x + width, y, x + width, y + height, radius);
  //  ctx.arcTo(x + width, y + height, x, y + height, radius);
  //  ctx.arcTo(x, y + height, x, y, radius);
  //  ctx.arcTo(x, y, x + width, y, radius);
  //  ctx.closePath();
  //}

  //private drawCard(
  //  pixels: number[][],
  //  context: CanvasRenderingContext2D,
  //  feature: FeatureLike
  //) {
  //  const [x, y] = pixels[0];
  //  const { cardX, cardY } = this.getCardRect(x, y);
  //  const desc = feature.get('description') || 'No description';
  //  const text =
  //    desc.length > 30 ? desc.slice(0, 30) + '…' : desc;

  //  // shadow + background
  //  context.save();
  //  context.shadowColor = 'rgba(0,0,0,0.3)';
  //  context.shadowBlur = 10;
  //  context.shadowOffsetX = 2;
  //  context.shadowOffsetY = 2;

  //  context.fillStyle = '#fff';
  //  context.beginPath();
  //  this.roundRect(
  //    context,
  //    cardX,
  //    cardY,
  //    this.cardWidth,
  //    this.cardHeight,
  //    this.cardRadius
  //  );
  //  context.fill();
  //  context.restore();

  //  // text
  //  context.save();
  //  context.fillStyle = '#000';
  //  context.font = '16px sans-serif';
  //  context.textBaseline = 'top';
  //  context.fillText(text, cardX + 10, cardY + 10);
  //  context.restore();
  //}



  private renderCircle(
    pixelCoordinates: number[][],
    state: any,
    type: string,
    zoom: number
  ): void {

    const context: CanvasRenderingContext2D = state.context;

    const ringColor = this.newsTypeColors[type] ?? '#000';
    const innerColor = ringColor;
    const [x, y] = pixelCoordinates[0];

    const outerRadius = 10 * (1.5 + zoom * 0.1);
    const innerRadius = 6 * (1.5 + zoom * 0.1);

    // Outer circle
    context.beginPath();
    context.arc(x, y, outerRadius, 0, 2 * Math.PI);
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = ringColor;
    context.stroke();

    // Inner circle
    context.beginPath();
    context.arc(x, y, innerRadius, 0, 2 * Math.PI);
    context.fillStyle = innerColor;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = ringColor;
    context.stroke();

  }

  private renderCard(
    pixelCoordinates: number[][],
    state: any
  ): void {
    const context: CanvasRenderingContext2D = state.context;
    const geom = state.geometry;

    const [x, y] = pixelCoordinates[0];

    const cardWidth = 400;
    const cardHeight = 100;
    const outerRadius = 10;

    const cardX = x - cardWidth / 2;
    const cardY = y - cardHeight - outerRadius - 20;

    const description = state.feature.get('description') || 'No description available';
    const text = description.length > 30 ? description.substring(0, 30) + '...' : description;

    const ringColor = '#398bf7';

    // Draw indicator line from point to card
    context.save();
    context.beginPath();
    context.moveTo(x, y - outerRadius);
    context.lineTo(x, cardY + cardHeight);
    context.strokeStyle = ringColor;
    context.lineWidth = 2;
    context.stroke();
    context.restore();

    // Card shadow setup
    context.save();
    context.shadowColor = 'rgba(0,0,0,0.3)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    // Draw card background (rounded rectangle)
    context.fillStyle = '#ffffff';
    context.beginPath();
    this.roundRect(context, cardX, cardY, cardWidth, cardHeight, 8);
    context.fill();
    context.restore();

    // Text inside card
    context.save();
    context.fillStyle = '#000000';
    context.font = '16px sans-serif';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillText(text, cardX + 10, cardY + 10);
    context.restore();

    // Draw center point
    context.save();
    context.fillStyle = ringColor;
    context.beginPath();
    context.arc(x, y, outerRadius, 0, 2 * Math.PI);
    context.fill();
    context.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }


  private getAdm2VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM2_simplified.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => this.createAdm2VectorLayerStyle("#398bf7", "#141A21"),
      minZoom: 7,
      zIndex: 80
    });
    return layer;
  }

  private getAdm3VectorLayer(): VectorLayer {
    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM3.geojson',
        format: new GeoJSON()
      }),
      /* style: (feature) => this.createAdm3VectorLayerStyle("#398bf7", 'rgb(0, 0, 0, 0)'),*/
      style: (feature: FeatureLike, resolution: number) => {
        // If this township has a disaster flag, always highlight:
        if (feature.get('hasDisaster') || feature.get('shapeName') == 'Pyinoolwin') {
          return this.createAdm3VectorLayerStyle("#FF4500", 'rgb(0, 0, 0, 0)');
        }
        // Otherwise use normal style (could hide at low zoom if you like)
        return this.createAdm3VectorLayerStyle("#398bf7", 'rgb(0, 0, 0, 0)');
      },
      // let it render during animations & interactions:
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      minZoom: 8,
      zIndex: 70
    });

    // Ensure the map is initialized before adding interaction
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (!this.map) {
          console.error('Map not initialized when setting up selection');
          return;
        }

        // Define select style function with stronger visual impact
        const selectStyle = (feature: FeatureLike) => {
          // Create a more visually distinct style
          return new Style({
            fill: new Fill({
              color: 'rgb(155, 191, 254, 0.2)', // Bright red with higher opacity
            }),
            stroke: new Stroke({
              color: '#9BBFFE',
              width: 2,        // Thicker stroke
            }),
            //text: new Text({
            //  text: feature.get('shapeName') || 'Selected',
            //  font: 'bold 16px Arial',
            //  fill: new Fill({ color: '#FFFFFF' }),
            //  stroke: new Stroke({ color: '#000000', width: 4 }),
            //  offsetY: -20
            //}),
            zIndex: 1000 // Ensure selected feature renders on top
          });
        };

        // Create selection interaction with proper configuration
        const select = new Select({
          condition: click,
          style: selectStyle,
          layers: [layer], // Only apply to this specific layer
          hitTolerance: 5   // Add some tolerance for clicking
        });

        // Add the interaction to the map
        this.map.addInteraction(select);

        // Add event listener for selection changes
        //select.on('select', (e) => {
        //  const selectedFeatures = e.selected;
        //  if (selectedFeatures.length > 0) {
        //    const feature = selectedFeatures[0];
        //    console.log('Selected feature:', feature.getProperties());

        //    // Update the static overlay with information from the feature.
        //    // For example, assume the feature has a property 'shapeName'.
        //    const contentEl = this.staticOverlayContent.nativeElement;
        //    contentEl.innerHTML = `<p><strong>Feature:</strong> ${feature.get('shapeName') || 'Unknown'}</p>`;

        //    // Multiple ways to ensure rendering
        //    this.map.renderSync();
        //    layer.changed();
        //    feature.changed();  // Force style refresh on the feature itself
        //  } else {
        //    // No feature selected; clear the overlay content.
        //    const contentEl = this.staticOverlayContent.nativeElement;
        //    contentEl.innerHTML = `<p>Select a feature</p>`;
        //  }
        //});
      }, 1000);

    });

    return layer;
  }

  private getTownVectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource(),
      style: (feature) => this.createAdm2VectorLayerStyle("#398bf7", "#141A21"),
      minZoom: 8,
      zIndex: 2000
    });
    return layer;
  }

  private getCityVectorLayer(): VectorLayer {

    // 1) turn your city list into OL Features
    const features = MYANMAR_CITIES.map(city => {
      const feat = new Feature({
        type: 'cityMarker',
        geometry: new Point(fromLonLat([city.lon, city.lat])),
      });
      return feat;
    });

    // 2) vector source & layer
    const source = new VectorSource({ features });
    const layer = new VectorLayer({
      source,
      style: (feature, resolution) => this.getCityStyle(feature, resolution),
      zIndex: 10000000,
      /* minZoom: 6,*/
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      declutter: true,
    });

    this.cityLayer = layer;

    return layer;
  }

  private getIconScale(resolution: number): number {
    const zoom = this.map.getView().getZoomForResolution(resolution) ?? 1;
    return 0.3 + zoom * 0.05;
  }

  private setupCityClick() {
    const select = new Select({
      condition: click,
      layers: [this.cityLayer],      // only select on your city layer
      style: (feature: FeatureLike) => {
        // enlarge the selected icon
        return new Style({
          image: new Icon({
            src: 'assets/icons/city-square.svg',
            scale: 1.2,
            anchor: [0.5, 1],
          })
        });
      }
    });

    this.map.addInteraction(select);

    select.on('select', (e) => {
      const selected = e.selected[0];
      if (selected) {
        // pull out the city object you stored on the feature
        this.selectedCity = (selected.get('city'));
        // markForCheck so OnPush picks it up
        this.cd.markForCheck();
      } else {
        this.selectedCity = null;
      }
    });
  }

  private createAdm0VectorLayerStyleV3(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {
    // Capture a fixed start time so all features animate in sync
    const startTime = Date.now();

    const customRenderer = (pixelCoords: any, state: any) => {
      const ctx = state.context as CanvasRenderingContext2D;
      const geom = state.geometry.clone();
      geom.setCoordinates(pixelCoords);

      // 1️⃣ Compute animation progress [0,1)
      //const period = 5000; // 5 seconds
      //const elapsed = (Date.now() - startTime) % period;
      //const t = elapsed / period;

      // 2️⃣ Prepare drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // 3️⃣ Build a gradient that “moves” by rotating its color stops
      //    We’ll use the polygon’s bbox to orient the gradient
      //const bl = getBottomLeft(geom.getExtent());
      //const tr = getTopRight(geom.getExtent());
      //const gradient = ctx.createLinearGradient(bl[0], bl[1], tr[0], tr[1]);
      // shift stops by t
      //gradient.addColorStop((0 + t) % 1, strokeColor);
      //gradient.addColorStop((0.5 + t) % 1, '#ffffff');
      //gradient.addColorStop((1 + t) % 1, strokeColor);

      // DASH DOT BORDER
      // ============================
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 6, 12, 6, 2, 6]);  // dash, gap, dash, gap, dot, gap
      ctx.lineDashOffset = 0;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      //// total cycle length   
      //const cycle = dashPattern.reduce((a, b) => a + b, 0);
      //ctx.lineDashOffset = -t * cycle;

      // Draw the polygon border with gradient & shadow
      const strokeStyle = new Stroke({
        color: strokeColor, // canvas‐gradient works here
        width: 2,
      });
      const renderCtx = toContext(ctx, { pixelRatio: 1 });
      renderCtx.setFillStrokeStyle(
        new Fill({ color: 'rgba(0,0,0,0)' }),
        strokeStyle
      );
      renderCtx.drawGeometry(geom);

      ctx.restore(); // remove shadow and dash settings

      // 6️⃣ (Optional) draw a static fill behind it
      ctx.save();
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = 0.4;
      renderCtx.setFillStrokeStyle(state.fillStyle, new Stroke({ color: 'rgba(0,0,0,0)' }));
      renderCtx.drawGeometry(geom);
      ctx.restore();

      // 7️⃣ (Optional) draw a text label at the polygon centroid
      if (textLabel) {
        const centerPixel = pixelCoords[Math.floor(pixelCoords.length / 2)];
        ctx.save();
        ctx.fillStyle = strokeColor;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textLabel, centerPixel[0], centerPixel[1]);
        ctx.restore();
      }
    };

    return [
      new Style({
        renderer: customRenderer,
      }),
    ];
  }

  private createAdm0VectorLayerStyleV2(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {
    // Track animation time
    let lastAnimationStart = Date.now();
    const animationDuration = 5000; // 5 seconds between animations
    let animationProgress = 0; // 0 to 1

    const customRenderer = (pixelCoordinates: any, state: any) => {
      const ctx = state.context as CanvasRenderingContext2D;
      const currentTime = Date.now();

      // Reproject the geometry into pixel space
      const geom = state.geometry.clone();
      geom.setCoordinates(pixelCoordinates);

      // Get geometry extent for filling and animations
      const extent = geom.getExtent();
      const [minX, minY, maxX, maxY] = extent;
      const width = maxX - minX;
      const height = maxY - minY;

      // Calculate animation timing
      const timeSinceLastAnim = currentTime - lastAnimationStart;
      if (timeSinceLastAnim > animationDuration) {
        // Start a new animation cycle
        lastAnimationStart = currentTime;
        animationProgress = 0;
      } else {
        // Update animation progress (0 to 1 over 2 seconds, then stay at 1 for 3 more seconds)
        animationProgress = Math.min(1, timeSinceLastAnim / 2000);
      }

      // First pass: Fill with semi-transparent color or pattern
      ctx.save();
      const renderCtxFill = toContext(ctx, { pixelRatio: 1 });

      // Create a subtle gradient fill
      const gradientFill = ctx.createLinearGradient(minX, minY, maxX, maxY);
      gradientFill.addColorStop(0, 'rgba(20, 26, 33, 0.25)'); // Dark blue with transparency
      gradientFill.addColorStop(1, 'rgba(20, 26, 33, 0.1)');

      renderCtxFill.setFillStrokeStyle(
        new Fill({ color: gradientFill }),
        state.strokeStyle
      );
      renderCtxFill.drawGeometry(geom);
      ctx.restore();

      // Second pass: Create fancy dashed border with shadow
      ctx.save();

      // Add shadow effect
      ctx.shadowColor = 'rgba(57, 139, 247, 0.6)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Create dash-dot pattern: [dash, gap, dot, gap]
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 6, 2, 6]);
      ctx.lineDashOffset = 0;

      // Extract path from geometry to draw with our custom styles
      const renderCtx = toContext(ctx, { pixelRatio: 1 });
      renderCtx.setFillStrokeStyle(
        state.fillStyle,
        new Stroke({
          color: strokeColor,
          width: ctx.lineWidth,
          lineDash: [12, 6, 2, 6],
          lineDashOffset: 0,
          lineCap: 'round',
          lineJoin: 'round'
        })
      );
      renderCtx.drawGeometry(geom);
      ctx.restore();

      // Third pass: Animated gradient highlight that runs along the border
      if (animationProgress > 0) {
        ctx.save();

        // Calculate animation parameters
        const polygons = geom.getPolygons ? geom.getPolygons() : [geom];

        // For each polygon in the multipolygon
        polygons.forEach((polygon: any) => {
          // Get exterior ring (border)
          const linePath = polygon.getLinearRing(0).getCoordinates();
          const pathLength = linePath.length;

          // Calculate how much of the path to draw based on progress
          const drawLength = Math.floor(pathLength * animationProgress);

          if (drawLength > 1) {
            // Create gradient for the highlight
            const start = linePath[0];
            const end = linePath[Math.min(drawLength, pathLength - 1)];

            const gradient = ctx.createLinearGradient(start[0], start[1], end[0], end[1]);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(57, 139, 247, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            // Draw the animated section with thick glow
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.setLineDash([]);

            ctx.moveTo(linePath[0][0], linePath[0][1]);
            for (let i = 1; i <= drawLength && i < pathLength; i++) {
              ctx.lineTo(linePath[i][0], linePath[i][1]);
            }

            ctx.stroke();
          }
        });

        ctx.restore();
      }

      // Add label if provided
      if (textLabel) {
        const center = extentGetCenter(extent);
        ctx.save();

        // Text shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textLabel, center[0], center[1]);
        ctx.restore();
      }

      // Request animation frame to keep animation running
      if (animationProgress < 1 || timeSinceLastAnim > animationDuration - 100) {
        setTimeout(() => {
          if (state.layer) {
            state.layer.changed();
          }
        }, 16); // ~60fps
      }
    };

    return [new Style({
      renderer: customRenderer
    })];
  }

  private createEcoregionVectorLayerStyle(): WebGLStyle {
    return {
      'fill-color': ['interpolate', ['linear'], ['get', 'COLOR_NUM'],
        0, [100, 100, 100, 0.5],
        1, [255, 0, 0, 0.5],
        2, [0, 255, 0, 0.5],
        3, [0, 0, 255, 0.5],
        4, [255, 255, 0, 0.5]
      ],
      'stroke-color': [
        'case',
        ['==', ['get', 'ECO_ID'], ['var', 'highlightedId']],
        [255, 255, 255, 1],
        ['interpolate', ['linear'], ['get', 'COLOR_NUM'],
          0, [80, 80, 80, 1],
          1, [200, 0, 0, 1],
          2, [0, 200, 0, 1],
          3, [0, 0, 200, 1],
          4, [200, 200, 0, 1]
        ]
      ],
      'stroke-width': [
        'case',
        ['==', ['get', 'ECO_ID'], ['var', 'highlightedId']],
        3,
        1
      ]
    };
  }

  /**
 * Create a style that draws ADM‑0 polygons with a dash‑dash‑dot outline
 * + a soft shadow for better contrast.
 */
  private createAdm0VectorLayerStyle(
    strokeColor: string,
    fillColor = 'rgba(0,0,0,0)', // default = no fill
    textLabel?: string
  ): Style[] {

    const customRenderer: RenderFunction = (pixelCoordinates, state) => {

      const context: CanvasRenderingContext2D = state.context;

      const geometry = state.geometry.clone() as SimpleGeometry;
      geometry.setCoordinates(pixelCoordinates);

      context.save();
      //context.shadowColor = strokeColor;
      //context.shadowBlur = 15;
      context.lineWidth = 10;
      context.setLineDash([8, 6, 2, 6]); // — — · — — · pattern

      context.beginPath();
      const renderCtx = toContext(context, { pixelRatio: 1 });
      renderCtx.drawGeometry(geometry);

      context.stroke();
      context.restore();
    };

    return [new Style({ renderer: customRenderer })];
  }

  private getClockVectorLayer(): WebGLVectorLayer {

    const clockSource = new VectorSource();
    const layer = new WebGLVectorLayer({
      zIndex: 10000,
      source: clockSource,
      style: this.getClockLiteralStyle()
    });

    return layer;
  }

  private fragmentShader(): string {
    // A sample fragment shader that draws a clock with a radial reveal
    // plus swirling “particle” effect. For brevity.
    return `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform float u_progress;

      void main(void) {
        // v_texCoord in range -0.5..+0.5
        vec2 uv = v_texCoord * 2.0;
        float dist = length(uv);
        float angle = atan(uv.y, uv.x);
        if (angle < 0.0) angle += 6.283185307;

        // 2π * progress for radial reveal
        float angleMax = 6.283185307 * u_progress;
        // outside reveal or too big => transparent
        if (angle > angleMax || dist > 1.0) {
          gl_FragColor = vec4(0.0);
          return;
        }

        // base color for face
        vec4 clockColor = vec4(1.0, 1.0, 0.7, 1.0);

        // clock hands (minute + hour)
        float minuteAngle = mod(u_time, 60.0) / 60.0 * 6.283185307;
        float hourAngle   = mod(u_time, 720.0)/720.0* 6.283185307;
        float lineThickness = 0.05;

        float minDiff = abs(angle - minuteAngle);
        float hrDiff  = abs(angle - hourAngle);

        // minute hand up to dist<0.7
        if (minDiff < lineThickness && dist < 0.7) {
          clockColor = vec4(0.0,0.0,0.0,1.0);
        }
        // hour hand up to dist<0.5
        if (hrDiff < lineThickness && dist < 0.5) {
          clockColor = vec4(0.0,0.0,0.0,1.0);
        }

        // swirling particles if not fully drawn
        if (u_progress < 1.0 && dist > 0.8 && dist <= 1.0) {
          float swirl = 0.5 + 0.5*sin(angle*10.0 + u_time*5.0 + dist*5.0);
          if (swirl > 0.8) {
            clockColor = vec4(1.0,1.0,1.0, swirl);
          } else {
            clockColor.a = 0.0;
          }
        }

        gl_FragColor = clockColor;
      }
    `;
  }

  /**
  * Returns a "literal style" object recognized by WebGLVector.
  * We define a custom fragment shader that draws a radial "clock face" reveal,
  * swirling edges, and rotating hour/minute hands based on uniforms u_time + u_progress.
  */
  private getClockLiteralStyle(): any {
    return {
      symbol: {
        // required properties
        'symbol-type': 'square',      // each point is rendered in a bounding box of -0.5..+0.5
        'symbol-size': 80,           // in screen pixels
        'symbol-rotate-with-view': false,

        // custom fragment shader
        'fragment-shader': `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;
uniform float u_progress;

void main(void) {
  // coords from -0.5..+0.5 => scale to -1..+1
  vec2 uv = v_texCoord * 2.0;
  float dist = length(uv);
  float angle = atan(uv.y, uv.x);
  if (angle < 0.0) angle += 6.283185307;  // bring angle to 0..2PI

  // radial reveal => from 0..2PI based on u_progress
  float angleMax = 6.283185307 * u_progress;
  if (angle > angleMax || dist > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // base color for face
  vec4 clockColor = vec4(1.0, 1.0, 0.7, 1.0);

  // clock hands
  // minute hand rotates fully in 60s
  float minuteAngle = mod(u_time, 60.0)/60.0 * 6.283185307;
  // hour hand in 12 hours => 720s
  float hourAngle   = mod(u_time, 720.0)/720.0 * 6.283185307;
  float lineThickness = 0.05;

  float minDiff = abs(angle - minuteAngle);
  float hrDiff  = abs(angle - hourAngle);
  // draw minute hand if within lineThickness + dist < 0.7
  if (minDiff < lineThickness && dist < 0.7) {
    clockColor = vec4(0.0,0.0,0.0,1.0);
  }
  // hour hand => shorter
  if (hrDiff < lineThickness && dist < 0.5) {
    clockColor = vec4(0.0,0.0,0.0,1.0);
  }

  // swirling edges if not fully revealed
  if (u_progress < 1.0 && dist > 0.8 && dist <= 1.0) {
    float swirl = 0.5 + 0.5*sin(angle*10.0 + u_time*5.0 + dist*5.0);
    if (swirl > 0.8) {
      clockColor = vec4(1.0,1.0,1.0, swirl);
    } else {
      clockColor.a = 0.0;
    }
  }

  gl_FragColor = clockColor;
}
        `,

        // default uniform values
        'uniforms': {
          'u_time': 0,
          'u_progress': 0
        }
      }
    };
  }


  private addClockFeature(coordinate: number[]): void {
    // If you only want one clock at a time:
    this.clockSource.clear();
    const feature = new Feature(new Point(coordinate));
    this.clockSource.addFeature(feature);

    // Kick off the 3-second animation
    this.startClockAnimation();
  }

  /**
   * Animates the clock by updating 'u_time' and 'u_progress' each frame.
   * - 'u_time': how many seconds since we started
   * - 'u_progress': radial reveal from 0..1 over ~3 seconds
   */
  private startClockAnimation() {
    this.animStart = performance.now();
    const animateFrame = () => {
      const now = performance.now();
      const elapsedSec = (now - this.animStart) / 1000.0;

      // progress from 0..1 in 3 seconds
      let progress = elapsedSec / 3.0;
      if (progress > 1.0) progress = 1.0;

      //// update style uniforms
      //const styleObj = this.clockLayer.getStyle() as any;  // cast to any if TS complains
      //if (styleObj && styleObj.symbol && styleObj.symbol.uniforms) {
      //  styleObj.symbol.uniforms['u_time'] = elapsedSec;
      //  styleObj.symbol.uniforms['u_progress'] = progress;
      //}

      // re-render map
      this.map.render();

      // continue animating
      this.animReq = requestAnimationFrame(animateFrame);
    };
    animateFrame();
  }

  private animateClock() {
    const now = performance.now();
    const elapsed = (now - this.animStart) / 1000.0; // seconds
    let progress = elapsed / 3.0;
    if (progress > 1.0) progress = 1.0;

    // Update the uniforms for the WebGLPoints layer
    this.clockLayer.updateStyleVariables({
      u_time: elapsed,
      u_progress: progress
    });

    // Trigger re-render
    this.map.render();

    // Continue until 3s is up
    if (progress < 1.0) {
      this.animReq = requestAnimationFrame(() => this.animateClock());
    } else {
      // If you want indefinite swirl:
      // this.animReq = requestAnimationFrame(() => this.animateClock());
      this.animReq = null;
    }
  }

  private createAdm1VectorLayerStyle(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {

    const glow = new Stroke({ color: 'rgba(255,255,255,0.5)', width: 7 });
    const dash = new Stroke({
      color: strokeColor,
      width: 5,
      lineDash: [12, 6, 12, 6, 2, 6],
      lineCap: 'round',
      lineJoin: 'round',
    });

    const customRenderer: RenderFunction = (pixelCoordinates, state) => {

      const ctx = state.context as CanvasRenderingContext2D;
      const geom = state.geometry.clone() as any;
      geom.setCoordinates(pixelCoordinates);

      ctx.save();
      const renderCtx = toContext(ctx, { pixelRatio: 1 });

      renderCtx.setStyle(new Style({ stroke: glow }));
      renderCtx.drawGeometry(geom);


      //// First pass: Draw a glow effect
      //ctx.globalAlpha = 0.6;
      //ctx.shadowColor = strokeColor;
      //ctx.shadowBlur = 8;
      //ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      //ctx.lineWidth = 7;
      //ctx.beginPath();


      //renderCtx.drawGeometry(geom);
      //ctx.stroke();

      //// Second pass: Draw the dashed line
      //ctx.globalAlpha = 1.0;
      //ctx.shadowBlur = 0;
      //ctx.strokeStyle = strokeColor;
      //ctx.lineWidth = 5;
      //ctx.setLineDash([12, 6, 12, 6, 2, 6]);
      //ctx.lineDashOffset = 0;
      //ctx.lineJoin = 'round';
      //ctx.lineCap = 'round';
      //ctx.beginPath();

      //renderCtx.drawGeometry(geom);
      //ctx.stroke();

      ctx.restore();
    }

    return [new Style({
      renderer: customRenderer
    })];

    //// Outer stroke
    //const outerStrokeStyle = new Style({
    //  stroke: new Stroke({
    //    color: strokeColor,
    //    width: 2,
    //    lineDash: [12, 6, 2, 6, 2, 6],
    //    lineCap: 'round'
    //  })
    //});

    //const textStyle = new Style({
    //  text: textLabel
    //    ? new Text({
    //      text: textLabel,
    //      font: "'inherit'",
    //      fill: new Fill({ color: "#FFFFFF" }),
    //      /*stroke: new Stroke({ color: strokeColor, width: 2 })*/
    //    })
    //    : undefined
    //});

    //// Fill + text
    //const fillTextStyle = new Style({
    //  fill: new Fill({
    //    color: 'rgba(0, 0, 0, 0)'
    //  }),
    //  stroke: new Stroke({
    //    color: strokeColor,
    //    width: 1.5
    //  }),
    //  text: textLabel
    //    ? new Text({
    //      text: textLabel,
    //      font: "'inherit'",
    //      fill: new Fill({ color: "#a1aab2" }),
    //      stroke: new Stroke({ color: strokeColor, width: 2 })
    //    })
    //    : undefined
    //});

    /*return [outerStrokeStyle, textStyle];*/
  }

  private createAdm2VectorLayerStyle(
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
      ctx.lineWidth = 2;

      // First pass: Draw the outline of all polygons
      ctx.save();
      const renderCtx = toContext(ctx, { pixelRatio: 1 });
      renderCtx.setFillStrokeStyle(
        state.fillStyle,  // No fill yet, just stroke
        new Stroke({ color: strokeColor, width: 2 })
      );
      renderCtx.drawGeometry(geom);
      ctx.restore();
    }

    return [new Style({
      renderer: customRenderer
    })];

    // Outer stroke
    //const outerStrokeStyle = new Style({
    //  stroke: new Stroke({
    //    color: strokeColor,
    //    lineDash: [4, 6], // 4px dash, 6px gap
    //    width: 1,
    //  })
    //});

    //const textStyle = new Style({
    //  text: new Text({
    //    text: textLabel,
    //    font: "'inherit'",
    //    fill: new Fill({ color: "#FFFFFF" }),
    //    /*stroke: new Stroke({ color: strokeColor, width: 2 })*/
    //  })
    //});

    //// Fill + text
    //const fillTextStyle = new Style({
    //  fill: new Fill({
    //    color: 'rgba(0, 0, 0, 0)'
    //  }),
    //  stroke: new Stroke({
    //    color: strokeColor,
    //    width: 1.5
    //  }),
    //  text: textLabel
    //    ? new Text({
    //      text: textLabel,
    //      font: "bold 14px sans-serif",
    //      fill: new Fill({ color: "#FFFFFF" }),
    //      stroke: new Stroke({ color: strokeColor, width: 2 })
    //    })
    //    : undefined
    //});

    /*return [outerStrokeStyle, textStyle];*/
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
      ctx.lineWidth = 2;

      // First pass: Draw the outline of all polygons
      ctx.save();
      const renderCtx = toContext(ctx, { pixelRatio: 1 });
      renderCtx.setFillStrokeStyle(
        state.fillStyle,  // No fill yet, just stroke
        new Stroke({ color: strokeColor, width: 2 })
      );
      renderCtx.drawGeometry(geom);
      ctx.restore();
    }

    return [new Style({
      renderer: customRenderer
    })];

    //// Outer stroke
    //const outerStrokeStyle = new Style({
    //  stroke: new Stroke({
    //    color: strokeColor,
    //    width: 0.8,
    //    lineDash: [4, 6], // 4px dash, 6px gap
    //    lineDashOffset: 4
    //  })
    //});

    //const textStyle = new Style({
    //  text: new Text({
    //    text: textLabel,
    //    font: "'inherit'",
    //    fill: new Fill({ color: "#FFFFFF" }),
    //    /*stroke: new Stroke({ color: strokeColor, width: 2 })*/
    //  })
    //});

    //const fillStyle = new Style({
    //  fill: new Fill({
    //    color: fillColor
    //  }),
    //});

    //return [outerStrokeStyle, fillStyle, textStyle];
  }

  /**
  * Returns a simple fill and stroke style using Material Design colors.
  * Optionally includes text on the stroke's last style if given.
  */

  private createStyle(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {
    // Outer stroke
    const outerStrokeStyle = new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: 3,
      })
    });

    // Fill + text
    const fillTextStyle = new Style({
      fill: new Fill({
        color: fillColor
      }),
      stroke: new Stroke({
        color: strokeColor,
        width: 1.5
      }),
      text: textLabel
        ? new Text({
          text: textLabel,
          font: "bold 14px sans-serif",
          fill: new Fill({ color: "#FFFFFF" }),
          stroke: new Stroke({ color: strokeColor, width: 2 })
        })
        : undefined
    });

    return [outerStrokeStyle, fillTextStyle];
  }

  /**
  * Creates a heatmap layer from earthquake data
  * @param earthquakeData GeoJSON data from USGS
  */
  private getEarthquakeHeatmapLayer(): Heatmap {

    const layer = new Heatmap({
      source: new VectorSource({
        url: 'assets/geojson/earthquake/significant_month.geojson',
        format: new GeoJSON()
      }),
      blur: 15,
      radius: 10,
      weight: (feature) => {
        // Use earthquake magnitude as weight
        const magnitude = feature.get('mag');
        return Math.min(magnitude / 10, 1);
      },
      zIndex: 950
    });
    return layer;
  }

  // /**
  //* Creates a vector layer to display earthquakes as points
  //* @param earthquakeData GeoJSON data from USGS
  //*/
  // private createEarthquakeVectorLayer(earthquakeData: any): VectorLayer {
  //   // Parse GeoJSON data
  //   const features = new GeoJSON().readFeatures(earthquakeData, {
  //     featureProjection: 'EPSG:3857'
  //   });

  //   // Add features to source
  //   this.earthquakeSource.clear();
  //   this.earthquakeSource.addFeatures(features);

  //   // Create vector layer with styled points
  //   const layer = new VectorLayer({
  //     source: this.earthquakeSource,
  //     style: (feature) => this.styleEarthquakeFeature(feature),
  //     zIndex: 950
  //   });

  //   return layer;
  // }


  // /**
  //  * Styles earthquake points based on magnitude
  //  */
  // private styleEarthquakeFeature(feature: Feature): Style {
  //   const properties = feature.get('properties');
  //   if (!properties) return null;

  //   const magnitude = properties.mag;
  //   const depth = properties.depth;

  //   // Scale size based on magnitude (between 5-25px)
  //   const size = 5 + (magnitude * 2);

  //   // Color based on depth (shallow=red, deep=blue)
  //   let color;
  //   if (depth < 10) {
  //     color = 'rgba(255, 0, 0, 0.8)'; // Red for shallow
  //   } else if (depth < 50) {
  //     color = 'rgba(255, 165, 0, 0.8)'; // Orange for intermediate
  //   } else {
  //     color = 'rgba(0, 0, 255, 0.8)'; // Blue for deep
  //   }

  //   return new Style({
  //     image: new CircleStyle({
  //       radius: size,
  //       fill: new Fill({
  //         color: color
  //       }),
  //       stroke: new Stroke({
  //         color: 'white',
  //         width: 1
  //       })
  //     }),
  //     text: new Text({
  //       text: magnitude.toString(),
  //       fill: new Fill({
  //         color: '#fff'
  //       }),
  //       stroke: new Stroke({
  //         color: '#000',
  //         width: 2
  //       }),
  //       font: '10px Arial',
  //       offsetY: -5
  //     })
  //   });
  // }

  // /**
  //  * Loads and displays earthquake data
  //  */
  // private loadEarthquakeData(): void {
  //   this.fetchEarthquakeData('day', '2.5')
  //     .then(data => {
  //       console.log('Earthquake data loaded:', data.metadata.count, 'earthquakes');

  //       // Create both layer types
  //       this.earthquakeLayer = this.createEarthquakeVectorLayer(data);
  //       this.earthquakeHeatmapLayer = this.createEarthquakeHeatmapLayer(data);

  //       // Add the appropriate layer to the map
  //       if (this.showHeatmap) {
  //         this.map.addLayer(this.earthquakeHeatmapLayer);
  //       } else {
  //         this.map.addLayer(this.earthquakeLayer);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error loading earthquake data:', error);
  //     });
  // }

  // /**
  //  * Toggles between heatmap and point visualization
  //  */
  // toggleEarthquakeVisualization(): void {
  //   this.showHeatmap = !this.showHeatmap;

  //   // Remove existing layers
  //   if (this.earthquakeLayer) {
  //     this.map.removeLayer(this.earthquakeLayer);
  //   }
  //   if (this.earthquakeHeatmapLayer) {
  //     this.map.removeLayer(this.earthquakeHeatmapLayer);
  //   }

  //   // Add the appropriate layer
  //   if (this.showHeatmap) {
  //     this.map.addLayer(this.earthquakeHeatmapLayer);
  //   } else {
  //     this.map.addLayer(this.earthquakeLayer);
  //   }
  // }

  // /**
  //  * Fetches earthquake data from the USGS API
  //  * @param timeRange The time range for earthquake data ('hour', 'day', 'week', 'month')
  //  * @param minMagnitude Minimum earthquake magnitude (1.0, 2.5, 4.5, etc)
  //  */
  // private fetchEarthquakeData(timeRange: string = 'day', minMagnitude: string = '2.5'): Observable<any> {
  //   // USGS Earthquake API URL patterns:
  //   // https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/[minmag]_[timerange].geojson
  //   const apiUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMagnitude}_${timeRange}.geojson`;

  //   return this.http.get(apiUrl);
  // }

  private getCityStyle(feature: FeatureLike, resolution: number): Style {
    const zoom = this.map.getView().getZoomForResolution(resolution)!;
    const type = feature.get('type') as string;
    const ringColor = this.newsTypeColors[type] ?? '#FF4500'; // Outer ring color
    const innerColor = ringColor; // Inner circle color

    const innerSquareRenderer = (pixels: any, state: any) => {
      CustomRenderer.drawSquare(
        state.context,
        { x: pixels[0], y: pixels[1] },
        zoom,
        {
          size: 6,
          fillColor: innerColor,
          strokeColor: ringColor,
          strokeWidth: 2,
        } as SquareOpts
      );
    }

    const outerSquareRenderer = (pixels: any, state: any) => {
      CustomRenderer.drawSquare(
        state.context,
        { x: pixels[0], y: pixels[1] },
        zoom,
        {
          size: 12,
          fillColor: 'rgba(255, 255, 255, 1)',
          strokeColor: ringColor,
          strokeWidth: 5,
        } as SquareOpts
      );
    }

    return new Style({
      renderer: (pixels: any, state: any) => {
        outerSquareRenderer(pixels, state);
        innerSquareRenderer(pixels, state);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAnimation();

    // Clean up any other resources
    if (this.animReq) {
      cancelAnimationFrame(this.animReq);
      this.animReq = null;
    }

    // Ensure listener is removed
    if (this.listenerKey) {
      unByKey(this.listenerKey);
      this.listenerKey = null;
    }

    // remove OL event listener
    if (this.zoomListenerKey) {
      unByKey(this.zoomListenerKey);
      this.zoomListenerKey = null;
    }
  }
}
