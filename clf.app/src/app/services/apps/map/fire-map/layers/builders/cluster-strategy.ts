import { Injectable } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { Style, Circle, Fill, Stroke, Text } from 'ol/style';
import { StyleRegistry } from '../../styles/style-registry';

export interface ClusterOptions {
  distance?: number;
  minDistance?: number;
  zIndex?: number;
  style?: Style;
}

@Injectable({
  providedIn: 'root'
})
export class ClusterStrategy {
  constructor(private styleRegistry: StyleRegistry) {}

  /**
   * Create a clustered source from a vector source
   */
  createClusterSource(source: VectorSource<Feature<Geometry>>, options: ClusterOptions = {}): Cluster<Feature<Geometry>> {
    return new Cluster({
      distance: options.distance || 40,
      minDistance: options.minDistance || 20,
      source
    });
  }

  /**
   * Create a clustered layer
   */
  build(source: VectorSource<Feature<Geometry>>, options: ClusterOptions = {}): VectorLayer<VectorSource<Feature<Geometry>>> {
    const clusterSource = this.createClusterSource(source, options);

    return new VectorLayer({
      source: clusterSource,
      style: options.style || this.getClusterStyle(),
      zIndex: options.zIndex || 2
    });
  }

  /**
   * Get the default cluster style
   */
  private getClusterStyle(): (feature: Feature<Geometry>) => Style {
    return (feature: Feature<Geometry>) => {
      const size = feature.get('features').length;
      const style = new Style({
        image: new Circle({
          radius: 10 + Math.min(size, 20),
          fill: new Fill({
            color: this.getClusterColor(size)
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          })
        })
      });

      return style;
    };
  }

  /**
   * Get color based on cluster size
   */
  private getClusterColor(size: number): string {
    if (size > 100) return 'rgba(139, 0, 0, 0.8)';
    if (size > 50) return 'rgba(255, 0, 0, 0.8)';
    if (size > 20) return 'rgba(255, 165, 0, 0.8)';
    return 'rgba(255, 255, 0, 0.8)';
  }
}
