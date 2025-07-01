import { Injectable } from '@angular/core';
import { Feature, Overlay } from 'ol';
import { Geometry } from 'ol/geom';
import Map from 'ol/Map';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class FirePopupControl {
    private _popup: Overlay | null = null;
    readonly popupClosed$ = new Subject<void>();
  
    initialize(map: Map): void {
      this._popup = new Overlay({
        element: document.createElement('div'),
        positioning: 'bottom-center',
        offset: [0, -10]
      });
      map.addOverlay(this._popup);
    }
  
    showPopup(feature: Feature<Geometry>, coordinate: number[]): void {
      if (!this._popup) return;
      
      const content = this.createPopupContent(feature);
      this._popup.getElement()!.innerHTML = content;
      this._popup.setPosition(coordinate);
    }
  
    hidePopup(): void {
      if (!this._popup) return;
      this._popup.setPosition(undefined);
      this.popupClosed$.next();
    }
  
    private createPopupContent(feature: Feature<Geometry>): string {
      // Create popup content based on feature properties
      return `
        <div class="fire-popup">
          <h3>${feature.get('id')}</h3>
          <p>Severity: ${feature.get('severity')}</p>
          <p>Region: ${feature.get('region')}</p>
        </div>
      `;
    }
  }