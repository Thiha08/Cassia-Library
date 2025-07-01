import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Interaction } from 'ol/interaction';
import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { fromLonLat, transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Icon } from 'ol/style';
import { Coordinate } from 'ol/coordinate';
import { Pixel } from 'ol/pixel';
import BaseEvent from 'ol/events/Event';

/** Options for the LongPressInteraction */
interface LongPressOptions {
  holdDuration?: number;         // default 2000 ms
  maxMovement?: number;          // pixels allowed while holding
  vectorSource?: VectorSource;   // source to add the star feature
  mapProjection?: string;        // e.g. 'EPSG:3857'
  dataProjection?: string;       // e.g. 'EPSG:4326' if you want to store coords
}

export class LongPressEvent extends BaseEvent {
  public coordinate: number[];
  constructor(type: string, coordinate: number[]) {
    super(type);
    this.coordinate = coordinate;
  }
}

/**
 * A custom interaction that detects a "long press" (>= holdDuration ms)
 * on the map. If the user doesn't move beyond maxMovement, we add a "star" feature.
 */
export class LongPressInteraction extends Interaction {
  private holdDuration: number;
  private maxMovement: number;
  private timerId: any;
  private startPixel: Pixel | null = null;
  private pressed = false;
  private pressTime = 0;
  private vectorSource?: VectorSource;
  private mapProjection: string;
  private dataProjection: string;

  constructor(options: LongPressOptions = {}) {
    super({
      // Set handleEvent to capture pointer events
      handleEvent: (evt) => this.handleMapEvent(evt),
    });
    this.holdDuration = options.holdDuration ?? 2000; // default 2s
    this.maxMovement = options.maxMovement ?? 5;      // 5px threshold
    this.vectorSource = options.vectorSource;
    this.mapProjection = options.mapProjection ?? 'EPSG:3857';
    this.dataProjection = options.dataProjection ?? 'EPSG:3857';
  }

  // Called on every pointer/mouse event on the map
  private handleMapEvent(evt: MapBrowserEvent<any>): boolean {
    const type = evt.type;

    switch (type) {
      case 'pointerdown':
        this.onPointerDown(evt);
        break;
      case 'pointerup':
        this.onPointerUp(evt);
        break;
      case 'pointermove':
        this.onPointerMove(evt);
        break;
    }

    // By returning true, we let other interactions continue
    // If you return false, it stops event propagation.
    return true;
  }

  private onPointerDown(evt: MapBrowserEvent<PointerEvent>) {
    this.pressed = true;
    this.pressTime = Date.now();
    this.startPixel = evt.pixel;

    // Start a timer to check if the user is still pressing after 2s
    this.timerId = setTimeout(() => {
      // If still pressed => consider it a long press
      if (this.pressed) {
        this.dispatchEvent(new LongPressEvent('longpress', evt.coordinate));
        /*this.addStar(evt);*/
      }
    }, this.holdDuration);
  }

  private onPointerUp(evt: MapBrowserEvent<PointerEvent>) {
    // Release press
    this.pressed = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private onPointerMove(evt: MapBrowserEvent<PointerEvent>) {
    // If the user moves too far, cancel the long press
    if (this.pressed && this.startPixel) {
      const dx = evt.pixel[0] - this.startPixel[0];
      const dy = evt.pixel[1] - this.startPixel[1];
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq > this.maxMovement * this.maxMovement) {
        // Too far => not a "long press"
        this.pressed = false;
        if (this.timerId) {
          clearTimeout(this.timerId);
          this.timerId = null;
        }
      }
    }
  }

  private addStar(evt: MapBrowserEvent<any>) {
    // We'll add a star geometry at the pointer's coordinate
    const map = this.getMap();
    if (!map || !this.vectorSource) return;

    const coordinate = evt.coordinate;
    // Optionally transform to EPSG:4326 for your data or store as is
    // const lonLat = transform(coordinate, this.mapProjection, this.dataProjection);

    // Build a star around the pressed point
    const starGeom = this.createStarGeometry(coordinate, 5, 15, 30, 0);
    const feature = new Feature(starGeom);

    // Optionally set any attributes
    feature.set('timestamp', new Date().toISOString());

    // Add to the vector source
    this.vectorSource.addFeature(feature);
  }

  /**
   * Create a star geometry (Polygon) with a certain number of points, inner/outer radius, etc.
   * starPoints = number of points (5 => classic star).
   * radius1 = inner radius, radius2 = outer radius
   * angle = initial rotation in degrees
   */
  private createStarGeometry(center: Coordinate, starPoints: number, radius1: number, radius2: number, angle: number): Polygon {
    // Convert angle to radians
    const angleRad = (Math.PI * angle) / 180;

    // We'll build an array of coords
    const coords: Coordinate[] = [];
    const step = Math.PI / starPoints;

    for (let i = 0; i < 2 * starPoints; i++) {
      const r = i % 2 === 0 ? radius2 : radius1;
      const currAngle = i * step - Math.PI / 2 + angleRad;
      const x = center[0] + r * Math.cos(currAngle);
      const y = center[1] + r * Math.sin(currAngle);
      coords.push([x, y]);
    }
    // Close the polygon
    coords.push(coords[0]);
    return new Polygon([coords]);
  }
}
