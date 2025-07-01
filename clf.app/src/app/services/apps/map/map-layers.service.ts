// src/app/services/map-layers.service.ts
import { Injectable, signal } from '@angular/core';

export interface LayerToggleState {
  earth: boolean;
  water: boolean;
  air: boolean;
  fire: boolean;
  war: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MapLayersService {


  private tileStyleState = signal<string>('https://tiles.openfreemap.org/styles/positron');

  public readonly tileStyle$ = this.tileStyleState.asReadonly();

  // Initialize signals for each layer type
  private layerState = signal<LayerToggleState>({
    earth: true,
    water: true,
    air: true,
    fire: true,
    war: true
  });

  // Expose the layer state as a readonly signal
  public readonly layerState$ = this.layerState.asReadonly();

  // Toggle methods for each layer
  toggleEarthLayer(value?: boolean): void {
    this.layerState.update(state => ({
      ...state,
      earth: value !== undefined ? value : !state.earth
    }));
  }

  toggleWaterLayer(value?: boolean): void {
    this.layerState.update(state => ({
      ...state,
      water: value !== undefined ? value : !state.water
    }));
  }

  toggleAirLayer(value?: boolean): void {
    this.layerState.update(state => ({
      ...state,
      air: value !== undefined ? value : !state.air
    }));
  }

  toggleFireLayer(value?: boolean): void {
    this.layerState.update(state => ({
      ...state,
      fire: value !== undefined ? value : !state.fire
    }));
  }

  toggleWarLayer(value?: boolean): void {
    this.layerState.update(state => ({
      ...state,
      war: value !== undefined ? value : !state.war
    }));
  }

  setTileStyle(url: string) {
    this.tileStyleState.set(url);
  }

  updateTileTheme(theme: string): void {
    const styleUrl = theme === 'dark'
      ? 'https://tiles.openfreemap.org/styles/positron'  
      : 'https://tiles.openfreemap.org/styles/liberty';

    console.log(`Updating tile theme to: ${styleUrl} for theme: ${theme}`);
    this.setTileStyle(styleUrl);
  }
}
