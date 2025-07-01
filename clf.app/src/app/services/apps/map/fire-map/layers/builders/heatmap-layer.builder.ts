import { Injectable } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import Heatmap from 'ol/layer/Heatmap';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { FireEvent } from '../../models/fire-event.model';

export interface HeatmapOptions {
  radius?: number;
  blur?: number;
  gradient?: string[];
  weight?: string | ((feature: Feature<Geometry>) => number);
  zIndex?: number;
  opacity?: number;
  visible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HeatmapLayerBuilder {
  /**
   * Create a heatmap layer
   */
  build(source: VectorSource<Feature<Geometry>>, options: HeatmapOptions = {}): Heatmap {
    return new Heatmap({
      source,
      radius: options.radius || 15,
      blur: options.blur || 15,
      gradient: options.gradient || this.getDefaultGradient(),
      weight: options.weight || this.getDefaultWeight(),
      zIndex: options.zIndex || 1,
      opacity: options.opacity ?? 0.8,
      visible: options.visible ?? true
    });
  }

  /**
   * Create a vector source from fire events
   */
  createSource(events: readonly FireEvent[]): VectorSource<Feature<Geometry>> {
    const source = new VectorSource();
    const features = events.map(event => this.createFeature(event));
    source.addFeatures(features);
    return source;
  }

  /**
   * Convert fire event to feature
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

  /**
   * Get default weight function based on severity
   */
  private getDefaultWeight(): (feature: Feature<Geometry>) => number {
    return (feature: Feature<Geometry>) => {
      const severity = feature.get('severity');
      switch (severity) {
        case 'critical': return 1.0;
        case 'high': return 0.8;
        case 'medium': return 0.6;
        case 'low': return 0.4;
        default: return 0.5;
      }
    };
  }

  /**
   * Get default gradient colors
   */
  private getDefaultGradient(): string[] {
    return [
      'rgba(0, 0, 255, 0)',
      'rgba(0, 0, 255, 0.5)',
      'rgba(0, 255, 0, 0.5)',
      'rgba(255, 255, 0, 0.5)',
      'rgba(255, 165, 0, 0.5)',
      'rgba(255, 0, 0, 0.5)',
      'rgba(139, 0, 0, 0.5)'
    ];
  }
}
