export const DIVIDER_BASIC_HTML_SNIPPET = `  <mat-list>
              <mat-list-item>Item 1</mat-list-item>
              <mat-divider></mat-divider>
              <mat-list-item>Item 2</mat-list-item>
              <mat-divider></mat-divider>
              <mat-list-item>Item 3</mat-list-item>
            </mat-list>
`;

export const DIVIDER_INSET_HTML_SNIPPET = `  <mat-list>
                <mat-list-item>Home</mat-list-item>
                <mat-divider [inset]="true"></mat-divider>
                <mat-list-item>UI</mat-list-item>
                <mat-divider [inset]="true"></mat-divider>
                <mat-list-item>Forms</mat-list-item>
              </mat-list>
`;

export const DIVIDER_VERTICAL_HTML_SNIPPET = `  <mat-list class="d-flex">
              <mat-list-item>Home</mat-list-item>
              <mat-divider [vertical]="true"></mat-divider>
              <mat-list-item>UI</mat-list-item>
              <mat-divider [vertical]="true"></mat-divider>
              <mat-list-item>Forms</mat-list-item>
            </mat-list>
`;