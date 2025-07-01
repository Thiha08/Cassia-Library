import { Injectable } from "@angular/core";
import { DragPan, MouseWheelZoom } from "ol/interaction";
import Map from 'ol/Map';

// Mobile touch coordination
@Injectable({
    providedIn: 'root'
  })
  export class FireGestureControl {
    private _map: Map | null = null;
    private _dragInteraction: DragPan | null = null;
    private _zoomInteraction: MouseWheelZoom | null = null;
  
    initialize(map: Map, config: { enableDrag?: boolean; enableZoom?: boolean }): void {
      this._map = map;
      
      if (config.enableDrag) {
        this._dragInteraction = new DragPan();
        map.addInteraction(this._dragInteraction);
      }
  
      if (config.enableZoom) {
        this._zoomInteraction = new MouseWheelZoom();
        map.addInteraction(this._zoomInteraction);
      }
    }
  
    enable(): void {
      this._dragInteraction?.setActive(true);
      this._zoomInteraction?.setActive(true);
    }
  
    disable(): void {
      this._dragInteraction?.setActive(false);
      this._zoomInteraction?.setActive(false);
    }
  
    cleanup(): void {
      if (!this._map) return;
      
      if (this._dragInteraction) {
        this._map.removeInteraction(this._dragInteraction);
      }
      if (this._zoomInteraction) {
        this._map.removeInteraction(this._zoomInteraction);
      }
    }
  }