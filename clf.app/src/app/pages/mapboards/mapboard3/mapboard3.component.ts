import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, NgZone, Renderer2, ViewChild } from "@angular/core";
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
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { fromExtent } from "ol/geom/Polygon";
import VectorImageLayer from "ol/layer/VectorImage";
import VectorTileLayer from "ol/layer/VectorTile";
import { apply } from "ol-mapbox-style";

@Component({
  selector: 'app-mapboard3',
  imports: [MaterialModule],
  templateUrl: './mapboard3.component.html',
  styleUrls: ['./mapboard3.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMapboard3Component implements AfterViewInit {

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
  }

  private initializeMap(): void {
   
    // Define Myanmar extent with padding to limit map view
    const myanmarExtent: Extent = [
      ...fromLonLat([88.0, 3.0]),   // lower-left corner
      ...fromLonLat([108.0, 36.0])  // upper-right corner
    ];
    const degreePadding = 20.0;

    // Create base layers
    const osmLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0
    });

    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        new TileLayer(),
        this.getAdm0VectorLayer(),
        this.getAdm1VectorLayer(),
        this.getAdm2VectorLayer(),
        this.getAdm3VectorLayer()
      ],
      view: new View({
        center: getCenter(myanmarExtent),
        zoom: 4.5,
        minZoom: 4,
        maxZoom: 19,
        enableRotation: false,
        extent: buffer(myanmarExtent, degreePadding / 2) // Limit draggable area but still give some freedom
      })
    });

    apply(this.map, 'assets/geolayers/mapart.json');
  }

  private getAdm0VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM0_simplified.geojson',
        format: new GeoJSON()
      }),
      style: this.createStyle("#293959", "#141A21"),
      minZoom: 0,
      maxZoom: 6
    });
    return layer;
  }

  private getAdm1VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM1_simplified.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => this.createStyle("#293959", "#141A21", feature.get('shapeName')),
      minZoom: 6,
      maxZoom: 10
    });
    return layer;
  }

  private getAdm2VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM2_simplified.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => this.createStyle("#293959", "#141A21", feature.get('shapeName')),
      minZoom: 7
    });
    return layer;
  }

  private getAdm3VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM3_simplified.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => this.createStyle("#293959", "#141A21", feature.get('shapeName')),
      minZoom: 8,
    });

    return layer;
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
        width: 3
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
}
