import { AfterViewInit, Component, ElementRef, HostListener, NgZone, Renderer2, ViewChild } from "@angular/core";
import GeoJSON from "ol/format/GeoJSON";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from 'ol/Map';
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { MaterialModule } from 'src/app/material.module';
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import { buffer, Extent, getCenter } from "ol/extent";
import { MultiPolygon, Point, Polygon } from "ol/geom";
import Feature from "ol/Feature";
import { Circle, Fill, Stroke, Style } from "ol/style";
import { fromExtent } from "ol/geom/Polygon";
import VectorImageLayer from "ol/layer/VectorImage";

@Component({
  selector: 'app-mapboard2',
  imports: [MaterialModule],
  templateUrl: './mapboard2.component.html',
  styleUrls: ['./mapboard2.component.scss'],
  standalone: true,
})
export class AppMapboard2Component implements AfterViewInit {

  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  private map!: Map;

  constructor(
    private renderer: Renderer2,
    private ngZone: NgZone
  ) { }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initializeMap();
    });
    this.adjustMapSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.adjustMapSize();
  }

  private initializeMap(): void {
    const vectorSource = new VectorSource({
      url: 'assets/geojson/geoBoundaries-MMR-ADM0_simplified.geojson',
      format: new GeoJSON()
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.4)'
        }),
        stroke: new Stroke({
          color: 'rgba(100, 100, 100, 0.8)',
          width: 1.5,
        }),
      })
    });

    // Define a much larger extent for Myanmar to ensure the mask covers the entire draggable area
    const myanmarExtent: Extent = [
      ...fromLonLat([88.0, 3.0]), // lower left corner (minX, minY)
      ...fromLonLat([108.0, 36.0]) // upper right corner (maxX, maxY)
    ];

    // Use a larger padding to ensure mask covers all edges
    const degreePadding = 20.0;
    const paddedExtent = buffer(myanmarExtent, degreePadding);

    const outerRing = fromExtent(paddedExtent);
    const myanmarPolygon = vectorSource.getFeatures()[0].getGeometry() as MultiPolygon;
    const maskPolygon = new Polygon(outerRing.getCoordinates());

    myanmarPolygon.getPolygons().forEach((polygon: Polygon) => {
      if (polygon.getLinearRing(0)) {
        maskPolygon.appendLinearRing(polygon.getLinearRing(0)!);
      }
    });

    const maskFeature = new Feature(maskPolygon);
    const maskSource = new VectorSource({
      features: [maskFeature],
    });

    // Create a better cloud-like gradient
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1500;
    canvas.height = 1500;

    // Fill with dark background first
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate several cloud-like structures
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 100 + Math.random() * 150;

      const gradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, radius
      );

      // Create soft cloud edge effect
      gradient.addColorStop(0, 'rgba(100, 100, 180, 0.3)');
      gradient.addColorStop(0.4, 'rgba(50, 50, 100, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const pattern = ctx.createPattern(canvas, 'repeat');

    const maskImageLayer = new VectorLayer({
      source: maskSource,
      style: new Style({
        fill: new Fill({
          color: pattern || 'rgba(0, 0, 0, 0.7)'
        }),
        stroke: new Stroke({
          color: 'rgba(50, 50, 80, 0.8)',
          width: 2,
        }),
      }),
      opacity: 1.0
    });

    maskImageLayer.setZIndex(10);

    // Create stars with varying sizes for better visual effect
    const starsSource = new VectorSource();
    const [minX, minY, maxX, maxY] = paddedExtent;
    for (let i = 0; i < 300; i++) {
      const lon = minX + Math.random() * (maxX - minX);
      const lat = minY + Math.random() * (maxY - minY);
      const coord = [lon, lat];

      // Only add star if coordinate is outside Myanmar polygon
      if (!myanmarPolygon.intersectsCoordinate(coord)) {
        const starFeature = new Feature(new Point(coord));
        // Random size for more realistic star field
        starFeature.setProperties({ 'starSize': 1 + Math.random() * 2 });
        starsSource.addFeature(starFeature);
      }
    }

    const starsImageLayer = new VectorLayer({
      source: starsSource,
      style: (feature) => {
        return new Style({
          image: new Circle({
            radius: feature.get('starSize'),
            fill: new Fill({ color: 'rgba(255, 255, 255, 0.8)' })
          })
        });
      }
    });

    starsImageLayer.setZIndex(11);
    vectorLayer.setZIndex(12);

    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        maskImageLayer,
        starsImageLayer,
        vectorLayer
      ],
      view: new View({
        center: getCenter(myanmarExtent),
        zoom: 4.5,
        minZoom: 4,
        enableRotation: false,
        extent: buffer(myanmarExtent, degreePadding / 2) // Limit draggable area but still give some freedom
      })
    });
  }

  private adjustMapSize(): void {
    if (this.map) {
      this.map.updateSize();
    }
  }
}
