export const BASIC_SNACKBAR_HTML_SNIPPET = `  <div class="row">
          <div class="col-lg-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Message</mat-label>
              <input matInput value="Disco party!" #message />
            </mat-form-field>
          </div>
          <div class="col-lg-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Action</mat-label>
              <input matInput value="Dance" #action />
            </mat-form-field>
          </div>
          <div class="col-lg-4">
            <button mat-flat-button color="primary" (click)="openSnackBar(message.value, action.value)">
              Show snack-bar
            </button>
          </div>
        </div>
`;

export const CUSTOM_COMPONENT_SNACKBAR_HTML_SNIPPET = `  <div class="row">
          <div class="col-lg-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Snack bar duration (seconds)</mat-label>
              <input type="number" [(ngModel)]="durationInSeconds" matInput />
            </mat-form-field>
          </div>
          <div class="col-lg-4">
            <button mat-flat-button color="accent" (click)="openCustomSnackBar()"
              aria-label="Show an example snack-bar">
              Pizza party
            </button>
          </div>
        </div>
`;

export const CONFIGURABLE_SNACKBAR_HTML_SNIPPET = `  <div class="row">
          <div class="col-lg-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Horizontal position</mat-label>
              <mat-select [(value)]="horizontalPosition">
                <mat-option value="start">Start</mat-option>
                <mat-option value="center">Center</mat-option>
                <mat-option value="end">End</mat-option>
                <mat-option value="left">Left</mat-option>
                <mat-option value="right">Right</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="col-lg-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Vertical position</mat-label>
              <mat-select [(value)]="verticalPosition">
                <mat-option value="top">Top</mat-option>
                <mat-option value="bottom">Bottom</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="col-lg-4">
            <button mat-flat-button color="primary" (click)="openConfigSnackBar()"
              aria-label="Show an example snack-bar">
              Pool party!
            </button>
          </div>
        </div>
`;