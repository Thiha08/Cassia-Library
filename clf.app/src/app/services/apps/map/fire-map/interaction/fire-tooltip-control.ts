import { Injectable } from "@angular/core";
import { Feature, Overlay } from "ol";
import { Geometry } from "ol/geom";
import Map from 'ol/Map';

@Injectable({
    providedIn: 'root'
  })
  export class FireTooltipControl {
    private _tooltip: Overlay | null = null;
  
    initialize(map: Map): void {
      this._tooltip = new Overlay({
        element: document.createElement('div'),
        positioning: 'bottom-center',
        offset: [0, -10]
      });
      map.addOverlay(this._tooltip);
    }
  
    showTooltip(feature: Feature<Geometry>, coordinate: number[]): void {
      if (!this._tooltip) return;
      
      const content = this.createTooltipContent(feature);
      this._tooltip.getElement()!.innerHTML = content;
      this._tooltip.setPosition(coordinate);
    }
  
    hideTooltip(): void {
      if (!this._tooltip) return;
      this._tooltip.setPosition(undefined);
    }
  
    private createTooltipContent(feature: Feature<Geometry>): string {
      return `
        <div class="fire-tooltip">
          <p>${feature.get('severity')} - ${feature.get('region')}</p>
        </div>
      `;
    }
  }