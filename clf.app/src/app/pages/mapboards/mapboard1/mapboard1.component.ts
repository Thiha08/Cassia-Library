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
import { Extent, getCenter } from "ol/extent";

@Component({
  selector: 'app-mapboard1',
  imports: [MaterialModule],
  templateUrl: './mapboard1.component.html',
  styleUrls: ['./mapboard1.component.scss'],
})
export class AppMapboard1Component implements AfterViewInit {

  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  private map!: Map;

  constructor(
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {

  }

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
    });

    // Define the larger extent for Myanmar (in EPSG:3857)
    const myanmarExtent: Extent = [
      ...fromLonLat([88.0, 3.0]), // lower left corner (minX, minY)
      ...fromLonLat([108.0, 36.0]) // upper right corner (maxX, maxY)
    ];

    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer
      ],
      view: new View({
        center: getCenter(myanmarExtent),
        zoom: 4.5,
        minZoom: 4,
        enableRotation: false,
        extent: myanmarExtent
      })
    });
  }

  private adjustMapSize(): void {
    if (this.map) {
      this.map.updateSize();
    }
  }
}
