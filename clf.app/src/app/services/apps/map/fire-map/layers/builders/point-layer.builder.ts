import { Injectable } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { Style } from 'ol/style';
import { FireEvent } from '../../models/fire-event.model';
import { StyleRegistry } from '../../styles/style-registry';

export interface PointLayerOptions {
  zIndex?: number;
  minZoom?: number;
  maxZoom?: number;
  style?: Style;
  updateWhileAnimating?: boolean;
  updateWhileInteracting?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PointLayerBuilder {
  constructor(private styleRegistry: StyleRegistry) {}

  build(source: VectorSource<Feature<Geometry>>, options: PointLayerOptions = {}): VectorLayer<VectorSource<Feature<Geometry>>> {
    return new VectorLayer({
      source,
      style: options.style || this.styleRegistry.get('default'),
      zIndex: options.zIndex || 1,
      minZoom: options.minZoom,
      maxZoom: options.maxZoom,
      updateWhileAnimating: options.updateWhileAnimating ?? true,
      updateWhileInteracting: options.updateWhileInteracting ?? true
    });
  }

  /**
   * Creates a vector source from fire events
   */
  createSource(events: readonly FireEvent[]): VectorSource<Feature<Geometry>> {
    const source = new VectorSource();
    const features = events.map(event => this.createFeature(event));
    source.addFeatures(features);
    return source;
  }

  /**
   * Converts a fire event to an OpenLayers feature
   */
  private createFeature(event: FireEvent): Feature<Geometry> {
    const feature = new Feature({
      geometry: {
        type: 'Point',
        coordinates: event.geometry.coordinates
      }
    });

    // Set properties
    feature.setProperties({
      id: event.id,
      type: 'fire',
      severity: event.properties.severity,
      timestamp: event.properties.timestamp,
      region: event.properties.region,
      confidence: event.properties.confidence,
      ...event.properties
    });

    return feature;
  }
}
