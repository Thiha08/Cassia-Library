export const BASIC_TOOLTIPS_HTML_SNIPPET = `  <button mat-flat-button color="primary" matTooltip="Info about the action">
              Button
            </button>
`;

export const UPPERCASE_TOOLTIPS_HTML_SNIPPET = `  <button mat-flat-button color="primary" matTooltip="Info about the action">
              Button
            </button>
`;

export const DISABLED_CLICK_TOOLTIPS_HTML_SNIPPET = `  <button mat-flat-button color="primary" matTooltip="Info about the action"
              [matTooltipDisabled]="disabled.value" class="m-r-8">
              Action
            </button>

            <mat-checkbox [formControl]="disabled" class="example-disabled-checkbox">
              Tooltip disabled
            </mat-checkbox>
`;

export const POSITION_TOOLTIPS_HTML_SNIPPET = `  <button mat-flat-button color="primary" #tooltip="matTooltip" matTooltip="Info about the action"
              matTooltipPosition="below" matTooltipHideDelay="100000">
              Below
            </button>
            <button mat-flat-button color="accent" #tooltip="matTooltip" matTooltip="Info about the action"
              matTooltipPosition="above" class="m-l-8" matTooltipHideDelay="100000">
              Above
            </button>
            <button mat-flat-button color="warn" #tooltip="matTooltip" matTooltip="Info about the action"
              matTooltipPosition="left" class="m-l-8" matTooltipHideDelay="100000">
              Left
            </button>
            <button mat-flat-button color="primary" #tooltip="matTooltip" matTooltip="Info about the action"
              matTooltipPosition="right" class="m-l-8" matTooltipHideDelay="100000">
              Right
            </button>
`;

export const SHOW_AND_HIDE_TOOLTIPS_HTML_SNIPPET = `  <div class="row">
              <div class="col-sm-4">
                <mat-form-field class="w-100" appearance="outline">
                  <mat-label>Show delay</mat-label>
                  <input matInput type="number" [formControl]="showDelay" />
                  <mat-hint>milliseconds</mat-hint>
                </mat-form-field>
              </div>
              <div class="col-sm-4">
                <mat-form-field class="w-100" appearance="outline">
                  <mat-label>Hide delay</mat-label>
                  <input matInput type="number" [formControl]="hideDelay2" />
                  <mat-hint>milliseconds</mat-hint>
                </mat-form-field>
              </div>
              <div class="col-sm-4">
                <button mat-flat-button color="primary" matTooltip="Info about the action"
                  [matTooltipShowDelay]="showDelay.value" [matTooltipHideDelay]="hideDelay2.value">
                  Action
                </button>
              </div>
            </div>
`;

export const CHANGE_MESSAGE_TOOLTIPS_HTML_SNIPPET = `  <mat-form-field class="w-100" appearance="outline">
              <mat-label>Tooltip message</mat-label>
              <input matInput [formControl]="message" />
            </mat-form-field>

            <button mat-flat-button color="primary" [matTooltip]="message.value || ''"
              aria-label="Button that displays a tooltip with a custom message">
              Action
            </button>
`;