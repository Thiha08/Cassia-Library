import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, NgZone, Renderer2, ViewChild } from "@angular/core";
import { apply } from "ol-mapbox-style";
import { buffer, Extent, getCenter } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import Map from 'ol/Map';
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style, Text } from "ol/style";
import { WebGLStyle } from "ol/style/webgl";
import View from "ol/View";
import { MaterialModule } from 'src/app/material.module';
import { FireLayerManager } from "src/app/services/apps/map/fire-map/layers/fire-layer-manager";

@Component({
  selector: 'app-mapboard7',
  imports: [MaterialModule],
  templateUrl: './mapboard7.component.html',
  styleUrls: ['./mapboard7.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMapboard7Component implements AfterViewInit {

  private fireLayerManager = inject(FireLayerManager);

  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  private map!: Map;

  constructor(
    private renderer: Renderer2,
    private ngZone: NgZone
  ) { }

  ngAfterViewInit(): void {
    console.log('Mapboard7: Initializing component');
    this.ngZone.runOutsideAngular(() => {
      this.initializeMap();
      console.log('Mapboard7: Map initialized, initializing fire layer manager');
      this.fireLayerManager.initialize(this.map);
    });
  }

  private initializeMap(): void {
    console.log('Mapboard7: Starting map initialization');
   
    // Define Myanmar extent with padding to limit map view
    // const myanmarExtent: Extent = [
    //   ...fromLonLat([88.0, 3.0]),   // lower-left corner
    //   ...fromLonLat([108.0, 36.0])  // upper-right corner
    // ];

    const myanmarExtent: Extent = [
      88.0, 3.0,    // minX, minY (lower-left corner)
      108.0, 36.0   // maxX, maxY (upper-right corner)
    ];
    const degreePadding = 20.0;

    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
       /* this.getEcoRegions(),*/
        this.getBaseTileLayer(),
        this.getAdm0VectorLayer(),
        // this.getAdm1VectorLayer(),
        // this.getAdm2VectorLayer(),
        // this.getAdm3VectorLayer()
      ],
      view: new View({
        center: getCenter(myanmarExtent),
        projection: 'EPSG:4326',
        zoom: 4.5,
        minZoom: 4,
        maxZoom: 19,
        enableRotation: false,
        extent: buffer(myanmarExtent, degreePadding / 2) // Limit draggable area but still give some freedom
      })
    });

    console.log('Mapboard7: Map instance created');
    // apply(this.map, 'assets/geolayers/mapart.json');
  }

  private getBaseTileLayer(): TileLayer {

    const layer = new TileLayer({
      source: new OSM(),
      minZoom: 10, // Only visible when zoomed in very close
      zIndex: 10
    });

    return layer;
  }

  private getEcoRegions(): WebGLVectorLayer {

    const style: WebGLStyle = {
      'stroke-color': ['*', ['get', 'COLOR'], [220, 220, 220]],
      'stroke-width': 2,
      'stroke-offset': -1,
      'fill-color': ['*', ['get', 'COLOR'], [255, 255, 255, 0.6]],
    };

    const layer = new WebGLVectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/ecoregions.geojson',
        format: new GeoJSON()
      }),
      style: style,
      minZoom: 0,
      zIndex: 100,
    });
    return layer;
  }

  private getAdm0VectorLayer(): WebGLVectorLayer {

    const style: WebGLStyle = {
      'stroke-color': ['*', '#398bf7', [220, 220, 220]],
      'stroke-width': 1,
      'stroke-offset': -1,
      /*'fill-color': ['*', '#141A21', [255, 255, 255, 0.6]],*/
    };

    const layer = new WebGLVectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM0.geojson',
        format: new GeoJSON()
      }),
      style: style,
      minZoom: 0,
      zIndex: 100,
    });
    return layer;
  }

  private getAdm1VectorLayer(): WebGLVectorLayer {

    const style: WebGLStyle = {
      'stroke-color': ['*', '#398bf7', [220, 220, 220]],
      'stroke-width': 1,
      'stroke-offset': -1,
      /*'fill-color': ['*', '#141A21', [255, 255, 255, 0.6]],*/
    };

    const layer = new WebGLVectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM1_simplified.geojson',
        format: new GeoJSON()
      }),
      style: style,
      minZoom: 6,
      zIndex: 90
    });
    return layer;
  }

  private getAdm2VectorLayer(): WebGLVectorLayer {

    const style: WebGLStyle = {
      'stroke-color': ['*', '#398bf7', [220, 220, 220]],
      'stroke-width': 1,
      'stroke-offset': -1,
      /*'fill-color': ['*', '#141A21', [255, 255, 255, 0.6]],*/
    };

    const layer = new WebGLVectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM2_simplified.geojson',
        format: new GeoJSON()
      }),
      style: style,
      minZoom: 7,
      zIndex: 80
    });
    return layer;
  }

  private getAdm3VectorLayer(): WebGLVectorLayer {

    const style: WebGLStyle = {
      'stroke-color': ['*', '#398bf7', [220, 220, 220]],
      'stroke-width': 1,
      'stroke-offset': -1,
      /*'fill-color': ['*', '#141A21', [255, 255, 255, 0.6]],*/
    };

    const layer = new WebGLVectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM3_simplified.geojson',
        format: new GeoJSON()
      }),
      style: style,
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
