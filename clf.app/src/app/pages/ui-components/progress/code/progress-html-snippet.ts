export const PROGRESS_DETERMINATE_HTML_SNIPPET = `  <mat-progress-bar mode="determinate" value="40"></mat-progress-bar>
`;

export const PROGRESS_INDETERMINATE_HTML_SNIPPET = `  <mat-progress-bar mode="indeterminate"></mat-progress-bar>
`;

export const PROGRESS_QUERY_HTML_SNIPPET = `  <mat-progress-bar mode="query"></mat-progress-bar>
`;

export const PROGRESS_BUFFER_HTML_SNIPPET = `  <mat-progress-bar mode="buffer"></mat-progress-bar>
`;

export const PROGRESS_CONFIGURABLE_HTML_SNIPPET = `  <section class="example-section">
      <label class="example-margin">Mode:</label>
      <mat-radio-group [(ngModel)]="mode">
        <mat-radio-button class="example-margin" value="determinate">
          Determinate
        </mat-radio-button>
        <mat-radio-button class="example-margin" value="indeterminate">
          Indeterminate
        </mat-radio-button>
        <mat-radio-button class="example-margin" value="buffer">
          Buffer
        </mat-radio-button>
        <mat-radio-button class="example-margin" value="query">
          Query
        </mat-radio-button>
      </mat-radio-group>
    </section>

    @if (mode === 'determinate' || mode === 'buffer') {
      <section class="example-section">
        <label class="example-margin">Progress:</label>
        <mat-slider class="example-margin">
          <input type="range" [(ngModel)]="value" matSliderThumb>
        </mat-slider>
      </section>
    }
    @if (mode === 'buffer') {
      <section class="example-section">
        <label class="example-margin">Buffer:</label>
        <mat-slider class="example-margin">
          <input type="range" [(ngModel)]="bufferValue" matSliderThumb>
        </mat-slider>
      </section>
    }

    <div class="p-24 rounded bg-light-primary m-t-16">
          <h2 class="f-s-16 f-w-600 m-b-16 example-h2">Result</h2>
          <section class="example-section">
            <mat-progress-bar
                class="example-margin"
                [mode]="mode"
                [value]="value"
                [bufferValue]="bufferValue">
            </mat-progress-bar>
          </section>
        </div>
`;