import { Feature } from "ol";
import { Geometry } from "ol/geom";

export interface InteractionState {
    isDragging: boolean;
    isZooming: boolean;
    isSelecting: boolean;
    isHovering: boolean;
    activeFeature: Feature<Geometry> | null;
    hoveredFeature: Feature<Geometry> | null;
    lastClickCoordinate: number[] | null;
    lastHoverCoordinate: number[] | null;
    gestureMode: GestureMode;
    interactionMode: InteractionMode;
}

export enum GestureMode {
    NONE = 'none',
    DRAG = 'drag',
    ZOOM = 'zoom',
    SELECT = 'select',
    HOVER = 'hover'
}

export enum InteractionMode {
    NORMAL = 'normal',
    MEASURE = 'measure',
    DRAW = 'draw',
    EDIT = 'edit',
    REPLAY = 'replay'
}

export interface InteractionConfig {
    enableClick?: boolean;
    enableHover?: boolean;
    enableDrag?: boolean;
    enableZoom?: boolean;
    enablePopup?: boolean;
    enableTooltip?: boolean;
}

