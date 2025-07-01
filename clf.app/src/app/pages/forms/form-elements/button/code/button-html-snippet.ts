export const BASIC_BUTTONS_HTML_SNIPPET = `  <div class="d-flex flex-sm-row flex-col align-items-center justify-content-center gap-8">
              <button mat-button>Basic</button>
              <button mat-button disabled>Disabled</button>
              <a mat-button href="https://www.google.com/" target="_blank">Link</a>
            </div>
`;

export const RAISED_BUTTONS_HTML_SNIPPET = `  <div class="d-flex flex-sm-row flex-col align-items-center justify-content-center gap-8">
              <button mat-raised-button>Basic</button>
              <button mat-raised-button disabled>Disabled</button>
              <a mat-raised-button href="https://www.google.com/" target="_blank">Link</a>
            </div>
`;

export const OUTLINED_BUTTONS_HTML_SNIPPET = `  <div class="d-flex flex-sm-row flex-col align-items-center justify-content-center gap-8 flex-wrap">
              <button mat-stroked-button>Primary</button>
              <button mat-button class="b-1 border-secondary text-secondary">
                Secondary
              </button>
              <button mat-button class="b-1 border-warning text-warning">
                Warning
              </button>
              <button mat-button class="b-1 border-error text-error">
                Error
              </button>
              <button mat-button class="b-1 border-success text-success">
                Success
              </button>
              <button mat-button disabled>Disabled</button>
              <a mat-stroked-button href="https://www.google.com/" target="_blank">Link</a>
            </div>
`;

export const FLAT_BUTTONS_HTML_SNIPPET = `  <div class="d-flex flex-sm-row flex-col align-items-center justify-content-center gap-8 flex-wrap">
              <button mat-flat-button>Primary</button>
              <button mat-flat-button class="bg-secondary text-white">Secondary</button>
              <button mat-flat-button class="bg-warning text-white">Warning</button>
              <button mat-flat-button class="bg-error text-white">Error</button>
              <button mat-flat-button class="bg-success text-white">Success</button>
              <button mat-flat-button disabled>Disabled</button>
              <a mat-flat-button href="https://www.google.com/" target="_blank">Link</a>
            </div>
`;

export const ICON_BUTTONS_HTML_SNIPPET = `  <div class="d-flex gap-8 justify-content-center">
              <button mat-icon-button class="d-flex" aria-label="Example icon button with a vertical three dot icon">
                <i-tabler name="home-2" class="icon-20"></i-tabler>
              </button>
              <button mat-icon-button color="primary" class="d-flex" aria-label="Example icon button with a home icon">
                <i-tabler name="adjustments-alt" class="icon-20"></i-tabler>
              </button>
              <button mat-icon-button color="accent" class="d-flex" aria-label="Example icon button with a menu icon">
                <i-tabler name="apps" class="icon-20"></i-tabler>
              </button>
              <button mat-icon-button color="warn" class="d-flex" aria-label="Example icon button with a heart icon">
                <i-tabler name="heart-filled" class="icon-20"></i-tabler>
              </button>
              <button mat-icon-button disabled class="d-flex"
                aria-label="Example icon button with a open in new tab icon">
                <i-tabler name="message-2" class="icon-20"></i-tabler>
              </button>
            </div>
`;

export const FAB_BUTTONS_HTML_SNIPPET = `  <div class="d-flex flex-sm-row flex-col align-items-center justify-content-center gap-8">
              <button mat-fab class="bg-primary text-white" aria-label="Example icon button with a delete icon">
                <i-tabler name="trash"></i-tabler>
              </button>

              <button mat-fab class="bg-secondary text-white" aria-label="Example icon button with a bookmark icon">
                <i-tabler name="bookmark"></i-tabler>
              </button>

              <button mat-fab class="bg-warning text-white" aria-label="Example icon button with a home icon">
                <i-tabler name="home-2"></i-tabler>
              </button>

              <button mat-fab class="bg-error text-white" aria-label="Example icon button with a heart icon">
                <i-tabler name="heart-filled"></i-tabler>
              </button>

              <button mat-fab class="bg-success text-white" aria-label="Example icon button with a heart icon">
                <i-tabler name="access-point"></i-tabler>
              </button>

              <button mat-fab disabled aria-label="Example icon button with a heart icon">
                <i-tabler name="accessible"></i-tabler>
              </button>
            </div>
`;

export const MINI_FAB_BUTTONS_HTML_SNIPPET = `  <div class="d-flex flex-sm-row flex-col align-items-center justify-content-center gap-8">
              <button mat-mini-fab class="bg-primary text-white" aria-label="Example icon button with a delete icon">
                <i-tabler class="icon-20 d-flex" name="trash"></i-tabler>
              </button>

              <button mat-mini-fab class="bg-secondary text-white"
                aria-label="Example icon button with a bookmark icon">
                <i-tabler class="icon-20 d-flex" name="bookmark"></i-tabler>
              </button>

              <button mat-mini-fab class="bg-warning text-white" aria-label="Example icon button with a home icon">
                <i-tabler class="icon-20 d-flex" name="home-2"></i-tabler>
              </button>

              <button mat-mini-fab class="bg-error text-white" aria-label="Example icon button with a home icon">
                <i-tabler class="icon-20 d-flex" name="access-point"></i-tabler>
              </button>

              <button mat-mini-fab class="bg-success text-white" aria-label="Example icon button with a home icon">
                <i-tabler class="icon-20 d-flex" name="home-2"></i-tabler>
              </button>

              <button mat-mini-fab disabled aria-label="Example icon button with a heart icon">
                <i-tabler class="icon-20 d-flex" name="accessible"></i-tabler>
              </button>
            </div>
`;

export const EXTENDED_FAB_BUTTONS_HTML_SNIPPET = `  <div class="d-flex flex-sm-row flex-col align-items-center justify-content-center gap-8">
              <button mat-fab extended aria-label="Example icon button with a delete icon">
                <div class="d-flex align-items-center">
                  <i-tabler class="icon-20 m-r-4" name="trash"></i-tabler><span> Delete</span>
                </div>
              </button>

              <button mat-fab extended aria-label="Example icon button with a bookmark icon">
                <div class="d-flex align-items-center">
                  <i-tabler class="icon-20 m-r-4" name="bookmark"></i-tabler>
                  Bookmark
                </div>
              </button>

              <button mat-fab extended aria-label="Example icon button with a home icon">
                <div class="d-flex align-items-center">
                  <i-tabler class="icon-20 m-r-4" name="home-2"></i-tabler> Home
                </div>
              </button>

              <button mat-fab extended disabled aria-label="Example icon button with a heart icon">
                <div class="d-flex align-items-center">
                  <i-tabler class="icon-20 m-r-4" name="heart-filled"></i-tabler>
                  Heart
                </div>
              </button>
            </div>
`;

export const BASIC_TOGGLE_BUTTONS_HTML_SNIPPET = `  <mat-button-toggle-group name="fontStyle" aria-label="Font Style">
              <mat-button-toggle value="bold">Bold</mat-button-toggle>
              <mat-button-toggle value="italic">Italic</mat-button-toggle>
              <mat-button-toggle value="underline">Underline</mat-button-toggle>
            </mat-button-toggle-group>
`;

export const MULTIPLE_SELECT_TOGGLE_BUTTONS_HTML_SNIPPET = `  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" multiple>
              <mat-button-toggle value="flour">Flour</mat-button-toggle>
              <mat-button-toggle value="eggs">Eggs</mat-button-toggle>
              <mat-button-toggle value="sugar">Sugar</mat-button-toggle>
            </mat-button-toggle-group>
`;

export const REACTIVE_FORM_TOGGLE_BUTTONS_HTML_SNIPPET = `  <mat-button-toggle-group [formControl]="fontStyleControl" aria-label="Font Style">
              <mat-button-toggle value="bold">Bold</mat-button-toggle>
              <mat-button-toggle value="italic">Italic</mat-button-toggle>
              <mat-button-toggle value="underline">Underline</mat-button-toggle>
            </mat-button-toggle-group>
            <p class="f-s-14 f-w-600 m-t-12">
              Chosen value is : {{ fontStyleControl.value }}
            </p>
`;

export const EXCLUSIVE_SELECTION_TOGGLE_BUTTONS_HTML_SNIPPET = `  <mat-button-toggle-group #group="matButtonToggleGroup">
              <mat-button-toggle value="left" aria-label="Text align left">
                <mat-icon>format_align_left</mat-icon>
              </mat-button-toggle>
              <mat-button-toggle value="center" aria-label="Text align center">
                <mat-icon>format_align_center</mat-icon>
              </mat-button-toggle>
              <mat-button-toggle value="right" aria-label="Text align right">
                <mat-icon>format_align_right</mat-icon>
              </mat-button-toggle>
              <mat-button-toggle value="justify" disabled aria-label="Text align justify">
                <mat-icon>format_align_justify</mat-icon>
              </mat-button-toggle>
            </mat-button-toggle-group>
            <div class="f-s-14 f-w-600 m-t-12">
              Selected value: {{ group.value }}
            </div>
`;