import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { FireLayerManager } from '../layers/fire-layer-manager';
import { GestureMode, InteractionConfig, InteractionMode, InteractionState } from '../models/interaction/interaction.model';
import { FirePopupControl } from './fire-popup-control';
import { FireTooltipControl } from './fire-tooltip-control';
import { FireGestureControl } from './fire-gesture-control';


@Injectable({
  providedIn: 'root'
})
export class FireInteractionManager implements OnDestroy {
  // Dependencies
  private popupControl = inject(FirePopupControl);
  private tooltipControl = inject(FireTooltipControl);
  private gestureControl = inject(FireGestureControl);

  // OpenLayers instances
  private _map: Map | null = null;
  //private _interactions = new Map<string, any>();
  private destroy$ = new Subject<void>();
  private _subscriptions: Subscription[] = [];

  // State management
  private _state$ = new BehaviorSubject<InteractionState>({
    isDragging: false,
    isZooming: false,
    isSelecting: false,
    isHovering: false,
    activeFeature: null,
    hoveredFeature: null,
    lastClickCoordinate: null,
    lastHoverCoordinate: null,
    gestureMode: GestureMode.NONE,
    interactionMode: InteractionMode.NORMAL
  });

  // Public observables
  readonly state$ = this._state$.asObservable();
  readonly isDragging$ = this.state$.pipe(map(s => s.isDragging));
  readonly isZooming$ = this.state$.pipe(map(s => s.isZooming));
  readonly activeFeature$ = this.state$.pipe(map(s => s.activeFeature));
  readonly hoveredFeature$ = this.state$.pipe(map(s => s.hoveredFeature));
  readonly interactionMode$ = this.state$.pipe(map(s => s.interactionMode));

  constructor() {
    this.setupSubscriptions();
  }

  /**
   * Initialize interaction manager with map instance
   */
  initialize(map: Map, config: InteractionConfig = {}): void {
    this._map = map;
    this.initializeInteractions(config);
    this.setupMapListeners();
    //this.setInteractionMode(config.defaultMode || InteractionMode.NORMAL);
  }

  /**
   * Setup interaction subscriptions
   */
  private setupSubscriptions(): void {
    // Subscribe to layer manager state changes
    // this._subscriptions.push(
    //   this.fireLayerManager.state$.pipe(
    //     takeUntil(this.destroy$)
    //   ).subscribe(state => {
    //     this.handleStateChange(state);
    //   })
    // );

    // // Subscribe to popup events
    // this._subscriptions.push(
    //   this.popupControl.popupClosed$.pipe(
    //     takeUntil(this.destroy$)
    //   ).subscribe(() => {
    //     this.fireLayerManager.selectFeature(null);
    //   })
    // );
  }

  /**
   * Initialize map interactions
   */
  private initializeInteractions(config: InteractionConfig): void {
    if (!this._map) return;

    // Initialize gesture manager
    this.gestureControl.initialize(this._map, {
      enableDrag: config.enableDrag ?? true,
      enableZoom: config.enableZoom ?? true
    });

    // Initialize popup manager
    if (config.enablePopup) {
      this.popupControl.initialize(this._map);
    }

    // Initialize tooltip manager
    if (config.enableTooltip) {
      this.tooltipControl.initialize(this._map);
    }
  }

  /**
   * Setup map event listeners
   */
  private setupMapListeners(): void {
    if (!this._map) return;

    // Click handling
    this._map.on('click', (event) => {
      this.handleMapClick(event);
    });

    // Hover handling
    this._map.on('pointermove', (event) => {
      this.handleMapHover(event);
    });

    // Drag handling
    //this._map.on('dragstart', (event) => {
      //this.handleDragStart(event);
    //});

    //this._map.on('dragend', (event) => {
      //this.handleDragEnd(event);
    //});
  }

  /**
   * Handle map click events
   */
  private handleMapClick(event: any): void {
    if (!this._map) return;

    const feature = this._map.forEachFeatureAtPixel(event.pixel,
      (f) => f
    );

    // if (feature) {
    //   this.fireLayerManager.selectFeature(feature);
    //   this.popupControl.showPopup(feature, event.coordinate);
    // } else {
    //   this.fireLayerManager.selectFeature(null);
    //   this.popupControl.hidePopup();
    // }
  }

  /**
   * Handle map hover events
   */
  private handleMapHover(event: any): void {
    if (!this._map) return;

    const feature = this._map.forEachFeatureAtPixel(event.pixel,
      (f) => f as Feature<Geometry>
    );

    if (feature) {
      this.tooltipControl.showTooltip(feature, event.coordinate);
    } else {
      this.tooltipControl.hideTooltip();
    }
  }

  /**
   * Handle drag start
   */
  private handleDragStart(event: any): void {
    this.tooltipControl.hideTooltip();
    this.popupControl.hidePopup();
  }

  /**
   * Handle drag end
   */
  private handleDragEnd(event: any): void {
    // Refresh data if needed
    // this.fireLayerManager.refreshData();
  }

  /**
   * Handle layer manager state changes
   */
  private handleStateChange(state: any): void {
    // Update interactions based on state
    if (state.replayMode) {
      this.disableInteractions();
    } else {
      this.enableInteractions();
    }
  }

  /**
   * Enable all interactions
   */
  private enableInteractions(): void {
    // this.gestureControl.enable();
    // this.popupControl.enable();
    // this.tooltipControl.enable();
  }

  /**
   * Disable all interactions
   */
  private disableInteractions(): void {
    // this.gestureControl.disable();
    // this.popupControl.disable();
    // this.tooltipControl.disable();
  }

  /**
   * Clean up resources
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this.cleanupInteractions();
  }

  /**
   * Clean up interactions
   */
  private cleanupInteractions(): void {
    if (!this._map) return;

    // Remove event listeners
    // this._map.un('click', this.handleMapClick);
    // this._map.un('pointermove', this.handleMapHover);
    // this._map.un('dragstart', this.handleDragStart);
    // this._map.un('dragend', this.handleDragEnd);

    // // Clean up managers
    // this.popupControl.cleanup();
    // this.tooltipControl.cleanup();
    // this.gestureControl.cleanup();
  }
}
