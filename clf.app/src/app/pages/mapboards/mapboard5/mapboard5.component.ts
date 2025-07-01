import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, NgZone, Renderer2, ViewChild } from "@angular/core";
import GeoJSON from "ol/format/GeoJSON";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from 'ol/Map';
import { OSM, XYZ } from "ol/source";
import VectorSource from "ol/source/Vector";
import { MaterialModule } from 'src/app/material.module';
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import { buffer, Extent, getCenter } from "ol/extent";
import { MultiPolygon, Point, Polygon } from "ol/geom";
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
import { VectorTile } from "ol/layer";
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { LongPressInteraction } from "./long-press-interaction";

@Component({
  selector: 'app-mapboard5',
  imports: [MaterialModule],
  templateUrl: './mapboard5.component.html',
  styleUrls: ['./mapboard5.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMapboard5Component implements AfterViewInit {

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

    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        timeVectorLayer,
       /* this.getBase2TileLayer(),*/
        //this.getAdm0VectorLayer(),
        //this.getAdm1VectorLayer(),
        //this.getAdm2VectorLayer(),
       /* this.getMapVectorTileLayer(),*/
        this.getAdm3VectorLayer(),
        this.getTownVectorLayer(),
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

    apply(this.map, 'https://tiles.openfreemap.org/styles/liberty');

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

    // Add the custom interaction
    this.map.addInteraction(longPress);

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
 
  private getAdm0VectorLayer(): VectorLayer {

    const layer = new VectorLayer({
      source: new VectorSource({
        url: 'assets/geojson/geoBoundaries-MMR-ADM0_simplified.geojson',
        format: new GeoJSON()
      }),
      style: this.createAdm0VectorLayerStyle("#398bf7", "#141A21"),
      minZoom: 0,
      maxZoom: 6,
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
      style: (feature) => this.createAdm1VectorLayerStyle("#398bf7", "#141A21"),
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
      style: (feature) => this.createAdm3VectorLayerStyle("#398bf7", 'rgb(0, 0, 0, 0)'),
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
        select.on('select', (e) => {
          const selectedFeatures = e.selected;
          if (selectedFeatures.length > 0) {
            const feature = selectedFeatures[0];
            console.log('Selected feature:', feature.getProperties());

            // Multiple ways to ensure rendering
            this.map.renderSync();
            layer.changed();
            feature.changed();  // Force style refresh on the feature itself
          }
        });
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
        lineDash: [12, 6, 2, 6, 2, 6],
        lineCap: 'round'
      })
    });

    const textStyle = new Style({
      text: textLabel
        ? new Text({
          text: textLabel,
          font: "'inherit'",
          fill: new Fill({ color: "#FFFFFF" }),
          /*stroke: new Stroke({ color: strokeColor, width: 2 })*/
        })
        : undefined
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

    const fillStyle = new Style({
      fill: new Fill({
        color: fillColor
      }),
    });

    return [outerStrokeStyle, fillStyle, textStyle];
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
