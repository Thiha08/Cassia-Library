// timeline.control.ts
import { Control } from 'ol/control';
import { Options } from 'ol/control/Control';

/**
 * Custom TimelineControl options interface
 */
export interface TimelineControlOptions extends Options {
  /** Start date for the timeline */
  startDate?: Date;

  /** End date for the timeline */
  endDate?: Date;

  /** Current selected date */
  currentDate?: Date;

  /** Callback for date changes */
  onDateChange?: (date: Date) => void;

  /** Position of the control ('bottom', 'right') */
  position?: 'bottom' | 'right';

  /** Custom CSS class */
  className?: string;
}

/**
 * A custom OpenLayers control that displays a timeline for temporal data navigation
 */
export default class TimelineControl extends Control {
  private startDate: Date;
  private endDate: Date;
  private currentDate: Date;
  private onDateChangeCallback: (date: Date) => void;
  private sliderElement: HTMLInputElement;
  private dateDisplayElement: HTMLDivElement;
  private position: 'bottom' | 'right';

  constructor(options: TimelineControlOptions = {}) {
    // Create the control UI elements
    const element = document.createElement('div');
    element.className = `timeline-control ${options.className || ''}`;

    // Configure position (default: bottom)
    const position = options.position || 'bottom';
    element.classList.add(`timeline-control-${position}`);

    // Create date display
    const dateDisplay = document.createElement('div');
    dateDisplay.className = 'timeline-date-display';
    element.appendChild(dateDisplay);

    // Create slider
    const slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.className = 'timeline-slider';
    slider.setAttribute('min', '0');
    slider.setAttribute('max', '100');
    slider.setAttribute('step', '1');
    slider.setAttribute('value', '0');
    element.appendChild(slider);

    // Create play/pause button
    const playButton = document.createElement('button');
    playButton.className = 'timeline-play-button';
    playButton.innerHTML = '▶';
    element.appendChild(playButton);

    // Super constructor with element
    super({
      element: element,
      target: options.target
    });

    // Store references to DOM elements
    this.sliderElement = slider;
    this.dateDisplayElement = dateDisplay;
    this.position = position;

    // Initialize dates
    this.startDate = options.startDate || new Date(2023, 0, 1);
    this.endDate = options.endDate || new Date(2023, 11, 31);
    this.currentDate = options.currentDate || new Date(this.startDate);
    this.onDateChangeCallback = options.onDateChange || (() => { });

    // Event listeners
    this.sliderElement.addEventListener('input', this.handleSliderChange.bind(this));
    playButton.addEventListener('click', this.togglePlay.bind(this));

    // Initial update
    this.updateDateDisplay();
  }

  /**
   * Updates the control's date display with current date
   */
  private updateDateDisplay(): void {
    // Format date as YYYY-MM-DD
    const formattedDate = this.currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    this.dateDisplayElement.textContent = formattedDate;
  }

  /**
   * Handles slider input changes
   */
  private handleSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);

    // Convert slider value (0-100) to a date between start and end
    const totalRange = this.endDate.getTime() - this.startDate.getTime();
    const newTimestamp = this.startDate.getTime() + (totalRange * (value / 100));
    this.currentDate = new Date(newTimestamp);

    // Update display
    this.updateDateDisplay();

    // Call callback
    this.onDateChangeCallback(this.currentDate);
  }

  /**
   * Toggles timeline animation play/pause
   */
  private isPlaying = false;
  private animationInterval: number | null = null;

  private togglePlay(event: MouseEvent): void {
    event.preventDefault();

    const button = event.target as HTMLButtonElement;

    if (this.isPlaying) {
      // Stop animation
      if (this.animationInterval) {
        window.clearInterval(this.animationInterval);
        this.animationInterval = null;
      }
      button.innerHTML = '▶'; // Play symbol
    } else {
      // Start animation
      this.animationInterval = window.setInterval(() => {
        // Get current slider value
        let value = parseInt(this.sliderElement.value, 10);
        value += 1;

        // If we reach the end, reset to beginning
        if (value > 100) {
          value = 0;
        }

        // Update slider
        this.sliderElement.value = value.toString();

        // Trigger change event
        this.handleSliderChange({
          target: this.sliderElement
        } as unknown as Event);
      }, 200); // Update every 200ms

      button.innerHTML = '⏸'; // Pause symbol
    }

    this.isPlaying = !this.isPlaying;
  }

  /**
   * Sets the timeline date range
   */
  public setDateRange(startDate: Date, endDate: Date): void {
    this.startDate = startDate;
    this.endDate = endDate;

    // Reset current date if it's outside new range
    if (this.currentDate < startDate || this.currentDate > endDate) {
      this.currentDate = new Date(startDate);
      this.updateDateDisplay();
    }
  }

  /**
   * Sets the current date
   */
  public setCurrentDate(date: Date): void {
    if (date >= this.startDate && date <= this.endDate) {
      this.currentDate = new Date(date);

      // Update slider position
      const totalRange = this.endDate.getTime() - this.startDate.getTime();
      const datePosition = this.currentDate.getTime() - this.startDate.getTime();
      const percentage = (datePosition / totalRange) * 100;

      this.sliderElement.value = percentage.toString();
      this.updateDateDisplay();
    }
  }
}
