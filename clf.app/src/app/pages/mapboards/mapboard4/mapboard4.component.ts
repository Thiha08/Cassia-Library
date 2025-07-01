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
  selector: 'app-mapboard4',
  imports: [MaterialModule],
  templateUrl: './mapboard4.component.html',
  styleUrls: ['./mapboard4.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMapboard4Component implements AfterViewInit {

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

    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        this.getBaseTileLayer(),
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

  private getBaseTileLayer(): TileLayer {

    const layer = new TileLayer({
      source: new OSM(),
      minZoom: 10, // Only visible when zoomed in very close
      zIndex: 10
    });

    return layer;
  }

  private getAdm0VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM0_simplified.geojson',
        format: new GeoJSON()
      }),
      style: this.createAdm0VectorLayerStyle("#398bf7", "#141A21"),
      minZoom: 0,
      zIndex: 100,
    });
    return layer;
  }

  private getAdm1VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM1_simplified.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => this.createAdm1VectorLayerStyle("#398bf7", "#141A21", feature.get('shapeName')),
      minZoom: 6,
      zIndex: 90
    });
    return layer;
  }

  private getAdm2VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM2_simplified.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => this.createAdm2VectorLayerStyle("#398bf7", "#141A21", feature.get('shapeName')),
      minZoom: 7,
      zIndex: 80
    });
    return layer;
  }

  private getAdm3VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM3_simplified.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => this.createAdm3VectorLayerStyle("#398bf7", "#141A21", feature.get('shapeName')),
      minZoom: 8,
      zIndex: 70
    });

    return layer;
  }

  private createAdm0VectorLayerStyle(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {
    // Outer stroke
    const outerStrokeStyle = new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: 2,
      })
    });

    //// Fill + text
    //const fillTextStyle = new Style({
    //  fill: new Fill({
    //    color: 'rgba(0, 0, 0, 0)' // Transparent fill,
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

    return [outerStrokeStyle];
  }

  private createAdm1VectorLayerStyle(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {
    // Outer stroke
    const outerStrokeStyle = new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: 2,
      })
    });

    const textStyle = new Style({
      text: new Text({
        text: textLabel,
        font: "'inherit'",
        fill: new Fill({ color: "#FFFFFF" }),
        /*stroke: new Stroke({ color: strokeColor, width: 2 })*/
      })
    });

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

    return [outerStrokeStyle, textStyle];
  }

  private createAdm2VectorLayerStyle(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {
    // Outer stroke
    const outerStrokeStyle = new Style({
      stroke: new Stroke({
        color: strokeColor,
        lineDash: [4, 6], // 4px dash, 6px gap
        width: 1,
      })
    });

    const textStyle = new Style({
      text: new Text({
        text: textLabel,
        font: "'inherit'",
        fill: new Fill({ color: "#FFFFFF" }),
        /*stroke: new Stroke({ color: strokeColor, width: 2 })*/
      })
    });

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

    return [outerStrokeStyle, textStyle];
  }

  private createAdm3VectorLayerStyle(
    strokeColor: string,
    fillColor: string,
    textLabel?: string
  ): Style[] {
    // Outer stroke
    const outerStrokeStyle = new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: 0.8,
        lineDash: [4, 6], // 4px dash, 6px gap
        lineDashOffset: 4
      })
    });

    const textStyle = new Style({
      text: new Text({
        text: textLabel,
        font: "'inherit'",
        fill: new Fill({ color: "#FFFFFF" }),
        /*stroke: new Stroke({ color: strokeColor, width: 2 })*/
      })
    });

    //// Fill + text
    //const fillTextStyle = new Style({
    //  fill: new Fill({
    //    color: fillColor
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

    return [outerStrokeStyle, textStyle];
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
}
