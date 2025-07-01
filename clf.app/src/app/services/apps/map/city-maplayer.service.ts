// src/app/components/mapboards/city-maplayer/city-layer.service.ts

import { Injectable, signal } from '@angular/core';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { FeatureLike } from 'ol/Feature';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import Overlay from 'ol/Overlay';
import Map from 'ol/Map';
import { CustomRenderer, SquareOpts } from 'src/app/pages/mapboards/mapboard6/custom-renderer';


// Define city types
export type CityType = 'metro' | 'city' | 'town' | 'village';

export interface City {
  id: string;
  name: string;
  type: CityType;
  lat: number;
  lon: number;
  population?: number;
  area?: string;
  startDate?: Date;   // For timeline-based display (when the city appears)
  endDate?: Date;     // For timeline-based display (when the city disappears)
  minZoom?: number;   // Min zoom level at which this city becomes visible
  maxZoom?: number;   // Max zoom level at which this city remains visible
  [key: string]: any; // Allow additional properties
}

@Injectable({
  providedIn: 'root'
})
export class CityLayerService {
  // Map of icon paths by city type
  private iconMap: Record<CityType, string> = {
    metro: 'assets/icons/city-metro.svg',
    city: 'assets/icons/city-square.svg',
    town: 'assets/icons/city-town.svg',
    village: 'assets/icons/city-village.svg'
  };

  // Map of colors by city type
  private colorMap: Record<CityType, string> = {
    metro: '#FF5722',   // Orange
    city: '#2196F3',    // Blue
    town: '#4CAF50',    // Green
    village: '#9C27B0'  // Purple
  };

  // Current date for timeline filtering
  private currentDate = signal<Date>(new Date());

  // Cities currently visible (filtered by date and zoom)
  private visibleCities = signal<City[]>([]);

  /**
   * Creates a city layer with features filtered by date and zoom
   */
  createCityLayer(cities: City[]): VectorLayer<VectorSource> {
    // Initialize empty source
    const source = new VectorSource();

    // Create layer with dynamic styling
    const layer = new VectorLayer({
      source,
      style: (feature, resolution) => this.getCityStyle(feature, resolution),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      declutter: true, // Prevent overlapping icons
      zIndex: 10000,
    });

    // Tag the layer so we can find it later
    layer.set('layerType', 'cityLayer');

    // Create features for all cities
    const allFeatures = cities.map(city => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([city.lon, city.lat])),
        type: 'cityMarker',
        city: city, // Store the entire city object for later use
      });

      // Set custom properties for filtering
      feature.set('cityType', city.type);
      feature.set('startDate', city.startDate);
      feature.set('endDate', city.endDate);
      feature.set('minZoom', city.minZoom);
      feature.set('maxZoom', city.maxZoom);
      feature.setId(city.id);

      return feature;
    });

    // Add all features to the source
    source.addFeatures(allFeatures);

    return layer;
  }

  /**
   * Updates visible cities based on date and zoom
   */
  updateVisibleCities(layer: VectorLayer<VectorSource>, date: Date, zoom: number): void {
    if (!layer || !layer.getSource()) return;

    const source = layer.getSource()!;
    const features = source.getFeatures();

    // Hide all cities first
    features.forEach(feature => {
      feature.setStyle(new Style({})); // Empty style = invisible
    });

    // Filter cities by date and zoom
    const visibleFeatures = features.filter(feature => {
      const startDate = feature.get('startDate');
      const endDate = feature.get('endDate');
      const minZoom = feature.get('minZoom');
      const maxZoom = feature.get('maxZoom');

      // Check if city should be visible based on date
      const visibleByDate = (!startDate || date >= startDate) &&
        (!endDate || date <= endDate);

      // Check if city should be visible based on zoom
      const visibleByZoom = (!minZoom || zoom >= minZoom) &&
        (!maxZoom || zoom <= maxZoom);

      return visibleByDate && visibleByZoom;
    });

    // Set normal style for visible features
    visibleFeatures.forEach(feature => {
      feature.setStyle(null); // Use the layer's style function
    });

    // Update the visible cities signal
    const visibleCities = visibleFeatures.map(feature => feature.get('city'));
    this.visibleCities.set(visibleCities);

    // Force redraw
    layer.changed();
  }

  /**
   * Get city style based on city type and zoom level
   */
  private getCityStyle(feature: FeatureLike, resolution: number): Style {
    const map = feature.get('_map') as Map;
    const zoom = map?.getView().getZoomForResolution(resolution) ?? 6;
    const city = feature.get('city');

    if (!city) return new Style({}); // No city data, return empty style

    const type = city.type as CityType;
    const ringColor = this.colorMap[type] || '#398bf7';

    // Use custom renderer for dynamic drawing
    return new Style({
      renderer: (pixels: any, state: any) => {
        const zoomScaleFactor = 1 + (zoom * 0.05);

        // Outer square
        CustomRenderer.drawSquare(
          state.context,
          { x: pixels[0], y: pixels[1] },
          zoom,
          {
            size: type === 'metro' ? 14 :
              type === 'city' ? 12 :
                type === 'town' ? 10 : 8,
            fillColor: 'rgba(255, 255, 255, 1)',
            strokeColor: ringColor,
            strokeWidth: 2,
          } as SquareOpts
        );

        // Inner square
        CustomRenderer.drawSquare(
          state.context,
          { x: pixels[0], y: pixels[1] },
          zoom,
          {
            size: type === 'metro' ? 8 :
              type === 'city' ? 7 :
                type === 'town' ? 6 : 5,
            fillColor: ringColor,
            strokeColor: ringColor,
            strokeWidth: 1,
          } as SquareOpts
        );
      }
    });
  }

  /**
   * Adds click interaction to city layer
   */
  setupCityInteraction(
    map: Map,
    layer: VectorLayer<VectorSource>,
    onSelect: (city: City | null) => void
  ): void {
    // Create selection interaction
    const select = new Select({
      condition: click,
      layers: [layer],
      style: (feature) => {
        const city = feature.get('city');
        if (!city) return new Style({});

        const type = city.type as CityType;
        const ringColor = this.colorMap[type];

        // Return a larger version of the city icon
        return new Style({
          image: new Icon({
            src: this.iconMap[type],
            scale: 1.5, // Larger for selection
            anchor: [0.5, 1],
            color: ringColor,
          })
        });
      }
    });

    map.addInteraction(select);

    // Handle selection changes
    select.on('select', (e) => {
      const selected = e.selected[0];
      if (selected) {
        const city = selected.get('city');
        onSelect(city);
      } else {
        onSelect(null);
      }
    });
  }

  /**
   * Creates and sets up a popup overlay for city information
   */
  createCityPopup(map: Map, popupElement: HTMLElement): Overlay {
    const overlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      offset: [0, -10],
      autoPan: {
        animation: {
          duration: 250
        }
      }
    });

    map.addOverlay(overlay);
    return overlay;
  }

  /**
   * Updates the current timeline date
   */
  setCurrentDate(date: Date, layer: VectorLayer<VectorSource>, map: Map): void {
    this.currentDate.set(date);
    if (layer && map) {
      const zoom = map.getView().getZoom() || 6;
      this.updateVisibleCities(layer, date, zoom);
    }
  }

  /**
   * Gets the currently visible cities
   */
  getVisibleCities(): City[] {
    return this.visibleCities();
  }
}
