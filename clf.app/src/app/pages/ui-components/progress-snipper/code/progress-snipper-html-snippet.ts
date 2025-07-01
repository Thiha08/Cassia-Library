export const PROGRESS_SPINNER_BASIC_HTML_SNIPPET = `  <mat-spinner></mat-spinner>
`;

export const PROGRESS_SPINNER_CONFIGURABLE_HTML_SNIPPET = `  <h2 class="f-w-600 m-b-16 example-h2">Progress spinner configuration</h2>

        <section class="example-section">
          <label class="example-margin">Mode:</label>
          <mat-radio-group [(ngModel)]="mode">
            <mat-radio-button class="example-margin" value="determinate">
              Determinate
            </mat-radio-button>
            <mat-radio-button class="example-margin" value="indeterminate">
              Indeterminate
            </mat-radio-button>
          </mat-radio-group>
        </section>

        @if (mode === 'determinate') {
          <section class="example-section">
            <label class="example-margin">Progress:</label>
            <mat-slider class="example-margin">
              <input type="range" [(ngModel)]="value" matSliderThumb>
            </mat-slider>
          </section>
        }

        <div class="p-24 rounded bg-light-primary m-t-16">
          <h2 class="f-s-16 f-w-600 m-b-16 example-h2">Result</h2>

          <mat-progress-spinner
              class="example-margin"
              [mode]="mode"
              [value]="value">
          </mat-progress-spinner>
        </div>
`;