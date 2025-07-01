export const BASIC_RADIO_HTML_SNIPPET = `  <mat-radio-group aria-label="Select an option">
          <mat-radio-button value="1" color="primary">Option 1</mat-radio-button>
          <mat-radio-button value="2" color="primary">Option 2</mat-radio-button>
        </mat-radio-group>
`;

export const NG_NODEL_RADIO_HTML_SNIPPET = `  <label id="example-radio-group-label" class="f-w-600 d-block f-s-14">Pick your favorite season</label>
        <mat-radio-group aria-labelledby="example-radio-group-label" class="example-radio-group"
          [(ngModel)]="favoriteSeason">
          @for(season of seasons; track season) {
          <mat-radio-button class="example-radio-button" color="primary" [value]="season">
            {{ season }}
          </mat-radio-button>
          }
        </mat-radio-group>
        <div class="p-24 rounded bg-light m-t-16">
          <div class="f-w-600 f-s-14">
            Your favorite season is: {{ favoriteSeason }}
          </div>
        </div>
`;