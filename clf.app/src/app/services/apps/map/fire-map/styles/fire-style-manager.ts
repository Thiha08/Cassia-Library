import { Injectable, signal } from '@angular/core';
import { Style, Circle, Fill, Stroke, Text, Icon } from 'ol/style';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { DEFAULT_STYLE_CONFIG, FireSeverity, StyleConfig } from '../models/style/fire-style.model';


@Injectable({
  providedIn: 'root'
})
export class FireStyleManager {
  private _config = signal<StyleConfig>(DEFAULT_STYLE_CONFIG);
  private _styleCache = new Map<string, Style>();

  // Public config access
  readonly config = this._config;

  /**
   * Get default style for fire points
   */
  getDefaultStyle(): Style {
    return this.createPointStyle();
  }

  /**
   * Get style for a specific feature
   */
  getFeatureStyle(feature: Feature<Geometry>): Style {
    const severity = feature.get('severity') as FireSeverity;
    const isSelected = feature.get('selected') as boolean;
    const isHovered = feature.get('hovered') as boolean;

    return this.createPointStyle(severity, isSelected, isHovered);
  }

  /**
   * Get style for cluster features
   */
  getClusterStyle(feature: Feature<Geometry>): Style {
    const features = feature.get('features') as Feature<Geometry>[];
    const count = features.length;
    const severity = this.getClusterSeverity(features);

    return this.createClusterStyle(count, severity);
  }

  /**
   * Get style for heatmap
   */
  getHeatmapStyle(): Style {
    const config = this._config();
    return new Style({
      renderer: (pixel, state) => {
        const ctx = state.context;
        const radius = config.heatmapRadius;
        const gradient = ctx.createRadialGradient(
          Number(pixel[0]), Number(pixel[1]), 0,
          Number(pixel[0]), Number(pixel[1]), radius
        );

        config.heatmapGradient.forEach((color, index) => {
          gradient.addColorStop(index / (config.heatmapGradient.length - 1), color);
        });

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(Number(pixel[0]), Number(pixel[1]), radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  /**
   * Update style configuration
   */
  updateConfig(config: Partial<StyleConfig>): void {
    this._config.update(current => ({
      ...current,
      ...config
    }));
    this._styleCache.clear();
  }

  /**
   * Reset style configuration to defaults
   */
  resetConfig(): void {
    this._config.set(DEFAULT_STYLE_CONFIG);
    this._styleCache.clear();
  }

  // Private helper methods

  private createPointStyle(
    severity: FireSeverity = FireSeverity.MEDIUM,
    isSelected: boolean = false,
    isHovered: boolean = false
  ): Style {
    const config = this._config();
    const cacheKey = `point_${severity}_${isSelected}_${isHovered}`;
    
    if (this._styleCache.has(cacheKey)) {
      return this._styleCache.get(cacheKey)!;
    }

    const radius = isSelected ? config.pointRadius * 1.5 : config.pointRadius;
    const strokeWidth = isHovered ? config.pointStrokeWidth * 1.5 : config.pointStrokeWidth;

    const style = new Style({
      image: new Circle({
        radius,
        fill: new Fill({
          color: config.severityColors[severity]
        }),
        stroke: new Stroke({
          color: config.pointStrokeColor,
          width: strokeWidth
        })
      }),
      text: new Text({
        text: isSelected ? 'Selected' : '',
        font: config.textFont,
        fill: new Fill({
          color: config.textFill
        }),
        stroke: new Stroke({
          color: config.textStroke,
          width: config.textStrokeWidth
        }),
        offsetY: -radius - 5
      })
    });

    this._styleCache.set(cacheKey, style);
    return style;
  }

  private createClusterStyle(count: number, severity: FireSeverity): Style {
    const config = this._config();
    const cacheKey = `cluster_${count}_${severity}`;
    
    if (this._styleCache.has(cacheKey)) {
      return this._styleCache.get(cacheKey)!;
    }

    const style = new Style({
      image: new Circle({
        radius: config.clusterRadius,
        fill: new Fill({
          color: config.severityColors[severity]
        }),
        stroke: new Stroke({
          color: config.clusterStrokeColor,
          width: config.clusterStrokeWidth
        })
      }),
      text: new Text({
        text: count.toString(),
        font: config.textFont,
        fill: new Fill({
          color: config.textFill
        }),
        stroke: new Stroke({
          color: config.textStroke,
          width: config.textStrokeWidth
        })
      })
    });

    this._styleCache.set(cacheKey, style);
    return style;
  }

  private getClusterSeverity(features: Feature<Geometry>[]): FireSeverity {
    const severityCounts = features.reduce((acc, feature) => {
      const severity = feature.get('severity') as FireSeverity;
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<FireSeverity, number>);

    const severities: FireSeverity[] = [FireSeverity.CRITICAL, FireSeverity.HIGH, FireSeverity.MEDIUM, FireSeverity.LOW];
    return severities.find(severity => severityCounts[severity]) || FireSeverity.MEDIUM;
  }
}
