export const CONFIGURATION_SLIDER_HTML_SNIPPET = `  <div class="row">
          <div class="col-lg-3">
            <mat-form-field class="w-100" appearance="outline">
              <mat-label>Value</mat-label>
              <input matInput type="number" [(ngModel)]="value" />
            </mat-form-field>
          </div>
          <div class="col-lg-3">
            <mat-form-field class="w-100" appearance="outline">
              <mat-label>Min value</mat-label>
              <input matInput type="number" [(ngModel)]="min" />
            </mat-form-field>
          </div>
          <div class="col-lg-3">
            <mat-form-field class="w-100" appearance="outline">
              <mat-label>Max value</mat-label>
              <input matInput type="number" [(ngModel)]="max" />
            </mat-form-field>
          </div>
          <div class="col-lg-3">
            <mat-form-field class="w-100" appearance="outline">
              <mat-label>Step size</mat-label>
              <input matInput type="number" [(ngModel)]="step" />
            </mat-form-field>
          </div>
        </div>

        <section class="example-section">
          <mat-checkbox [(ngModel)]="showTicks" color="primary">Show ticks</mat-checkbox>
        </section>

        <section class="example-section">
          <mat-checkbox [(ngModel)]="thumbLabel" color="primary">Show thumb label</mat-checkbox>
        </section>

        <section class="example-section">
          <mat-checkbox [(ngModel)]="disabled" color="primary">Disabled</mat-checkbox>
        </section>

        <div class="p-24 rounded bg-light-primary m-t-16">
          <h2 class="f-s-16 f-w-600 m-b-16">Result</h2>

          <div>
            <label id="example-name-label" class="f-w-600 f-s-14">Value :
            </label>
            <label class="f-w-500 f-s-14">{{ value }}</label>
          </div>
          <mat-slider class="example-margin" [disabled]="disabled" [max]="max" [min]="min" [step]="step"
            [discrete]="thumbLabel" [showTickMarks]="showTicks">
            <input matSliderThumb [(ngModel)]="value" />
          </mat-slider>
        </div>
`;

export const CUSTOM_THUMB_LABEL_SLIDER_HTML_SNIPPET = `  <mat-slider min="0" max="100000" step="1000" showTickMarks discrete [displayWith]="formatLabel">
              <input matSliderThumb />
            </mat-slider>
`;

export const BASIC_SLIDER_HTML_SNIPPET = `  <mat-slider>
              <input matSliderThumb />
            </mat-slider>
`;

export const RANGE_SLIDER_HTML_SNIPPET = `  <mat-slider min="200" max="500">
              <input value="300" matSliderStartThumb />
              <input value="400" matSliderEndThumb />
            </mat-slider>
`;