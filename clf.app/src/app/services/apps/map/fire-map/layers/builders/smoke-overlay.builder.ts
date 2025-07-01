import { Injectable } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { Style, Fill, Stroke } from 'ol/style';
import { FireEvent } from '../../models/fire-event.model';

export interface SmokeOverlayOptions {
  zIndex?: number;
  opacity?: number;
  visible?: boolean;
  style?: Style;
}

@Injectable({
  providedIn: 'root'
})
export class SmokeOverlayBuilder {
  /**
   * Create a smoke overlay layer
   */
  build(source: VectorSource<Feature<Geometry>>, options: SmokeOverlayOptions = {}): VectorLayer<VectorSource<Feature<Geometry>>> {
    return new VectorLayer({
      source,
      style: options.style || this.getDefaultStyle(),
      zIndex: options.zIndex || 1,
      opacity: options.opacity ?? 0.6,
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
   * Convert fire event to feature with smoke geometry
   */
  private createFeature(event: FireEvent): Feature<Geometry> {
    // Create a circular smoke plume based on fire intensity
    const intensity = this.calculateIntensity(event);
    const radius = this.calculateRadius(intensity);
    const coordinates = event.geometry.coordinates;
    
    const feature = new Feature({
      geometry: {
        type: 'Circle',
        center: coordinates,
        radius: radius
      }
    });

    // Set properties
    feature.setProperties({
      id: event.id,
      type: 'smoke',
      intensity,
      timestamp: event.properties.timestamp,
      ...event.properties
    });

    return feature;
  }

  /**
   * Calculate smoke intensity based on fire properties
   */
  private calculateIntensity(event: FireEvent): number {
    const severity = event.properties.severity;
    const confidence = event.properties.confidence || 0.5;
    const temperature = event.properties.temperature || 0;

    let baseIntensity = 0.5;
    switch (severity) {
      case 'critical': baseIntensity = 1.0; break;
      case 'high': baseIntensity = 0.8; break;
      case 'medium': baseIntensity = 0.6; break;
      case 'low': baseIntensity = 0.4; break;
    }

    return (baseIntensity + (temperature / 1000) + confidence) / 3;
  }

  /**
   * Calculate smoke radius based on intensity
   */
  private calculateRadius(intensity: number): number {
    // Base radius in meters
    const baseRadius = 1000;
    return baseRadius * intensity;
  }

  /**
   * Get default style for smoke overlay
   */
  private getDefaultStyle(): Style {
    return new Style({
      fill: new Fill({
        color: 'rgba(200, 200, 200, 0.4)'
      }),
      stroke: new Stroke({
        color: 'rgba(150, 150, 150, 0.6)',
        width: 1
      })
    });
  }
}
