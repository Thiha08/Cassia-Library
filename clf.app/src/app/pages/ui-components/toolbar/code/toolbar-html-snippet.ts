export const BASIC_TOOLBAR_HTML_SNIPPET = `  <div class="row">
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

export const MULTI_ROW_TOOLBAR_HTML_SNIPPET = `  <mat-toolbar color="primary">
          <mat-toolbar-row>
            <span>Custom Toolbar</span>
          </mat-toolbar-row>

          <mat-toolbar-row>
            <span>Second Line</span>
            <span class="m-l-auto"></span>
            <mat-icon class="example-icon" aria-hidden="false"
              aria-label="Example user verified icon">verified_user</mat-icon>
          </mat-toolbar-row>

          <mat-toolbar-row>
            <span>Third Line</span>
            <span class="m-l-auto"></span>
            <div class="d-flex gap-8 align-items-center">
              <mat-icon class="example-icon" aria-hidden="false" aria-label="Example heart icon">favorite</mat-icon>
              <mat-icon class="example-icon" aria-hidden="false" aria-label="Example delete icon">delete</mat-icon>
            </div>
          </mat-toolbar-row>
        </mat-toolbar>
`;

export const ONLY_BRAND_TOOLBAR_HTML_SNIPPET = `  <mat-toolbar>
          <span>Modernize</span>
        </mat-toolbar>
`;