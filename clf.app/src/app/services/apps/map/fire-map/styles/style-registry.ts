// Runtime style modifications

import { Injectable } from '@angular/core';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

@Injectable({
  providedIn: 'root'
})
export class StyleRegistry {
  private styles = new Map<string, Style | ((feature: Feature<Geometry>) => Style)>();

  constructor() {
    this.registerDefaultStyles();
  }

  /**
   * Register a style with a name
   */
  register(name: string, style: Style | ((feature: Feature<Geometry>) => Style)): void {
    this.styles.set(name, style);
  }

  /**
   * Get a style by name
   */
  get(name: string): Style | ((feature: Feature<Geometry>) => Style) {
    return this.styles.get(name) || this.getDefaultStyle();
  }

  /**
   * Get the default style
   */
  private getDefaultStyle(): Style {
    return new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.8)'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    });
  }

  /**
   * Register default styles
   */
  private registerDefaultStyles(): void {
    // Default style
    this.register('default', this.getDefaultStyle());

    // Severity-based styles
    this.register('severity-low', new Style({
      image: new Circle({
        radius: 4,
        fill: new Fill({
          color: 'rgba(255, 255, 0, 0.8)'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 1
        })
      })
    }));

    this.register('severity-medium', new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: 'rgba(255, 165, 0, 0.8)'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));

    this.register('severity-high', new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.8)'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));

    this.register('severity-critical', new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({
          color: 'rgba(139, 0, 0, 0.8)'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));
  }
}
