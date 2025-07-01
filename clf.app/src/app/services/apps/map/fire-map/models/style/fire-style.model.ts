export interface StyleConfig {
    // Point styles
    pointRadius: number;
    pointStrokeWidth: number;
    pointStrokeColor: string;

    // Cluster styles
    clusterRadius: number;
    clusterStrokeWidth: number;
    clusterStrokeColor: string;

    // Heatmap styles
    heatmapRadius: number;
    heatmapBlur: number;
    heatmapGradient: string[];

    // Text styles
    textFont: string;
    textFill: string;
    textStroke: string;
    textStrokeWidth: number;

    // Severity colors
    severityColors: Record<FireSeverity, string>;
}

export enum FireSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
    pointRadius: 6,
    pointStrokeWidth: 2,
    pointStrokeColor: '#ffffff',

    clusterRadius: 10,
    clusterStrokeWidth: 2,
    clusterStrokeColor: '#ffffff',

    heatmapRadius: 15,
    heatmapBlur: 15,
    heatmapGradient: [
        'rgba(0, 0, 255, 0)',
        'rgba(0, 255, 0, 0.5)',
        'rgba(255, 255, 0, 0.8)',
        'rgba(255, 0, 0, 1)'
    ],

    textFont: '12px Arial',
    textFill: '#ffffff',
    textStroke: '#000000',
    textStrokeWidth: 2,

    severityColors: {
        low: '#00ff00',
        medium: '#ffff00',
        high: '#ff0000',
        critical: '#ff00ff'
    }
};
