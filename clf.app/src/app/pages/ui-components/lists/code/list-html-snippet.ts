export const LIST_BASIC_HTML_SNIPPET = `  <mat-list role="list">
                <mat-list-item role="listitem">Item 1</mat-list-item>
                <mat-list-item role="listitem">Item 2</mat-list-item>
                <mat-list-item role="listitem">Item 3</mat-list-item>
              </mat-list>
`;

export const LIST_TWOLINE_HTML_SNIPPET = `  <mat-list>
                <mat-list-item>
                  <span matListItemTitle class="f-s-16 f-w-600">Title</span>
                  <span matListItemLine class="f-s-14">Second line</span>
                </mat-list-item>
                <mat-list-item>
                  <span matListItemTitle class="f-s-16 f-w-600">Title</span>
                  <span matListItemLine class="f-s-14">Second line</span>
                </mat-list-item>
              </mat-list>
`;

export const LIST_THREELINE_HTML_SNIPPET = `  <mat-list>
                <mat-list-item>
                  <span matListItemTitle class="f-s-16 f-w-600">Title</span>
                  <span matListItemLine class="f-s-14">Second line</span>
                  <span matListItemLine class="f-s-14">Third line</span>
                </mat-list-item>
                <mat-list-item>
                  <span matListItemTitle class="f-s-16 f-w-600">Title</span>
                  <span matListItemLine class="f-s-14"
                    >Second line. This line will truncate.</span
                  >
                  <span class="f-s-14">Third line</span>
                </mat-list-item>
              </mat-list>
`;


export const LIST_THREELINE_TEXT_WRAPPING_HTML_SNIPPET = `  <mat-list style="max-width: 500px">
              <mat-list-item lines="3">
                <span matListItemTitle class="f-s-16 f-w-600">Title</span>
                <span class="f-s-14"
                  >Secondary line that will wrap because the list lines is
                  explicitly set to 3 lines. Text inside of a 'matListItemTitle'
                  or 'matListItemLine' will never wrap.
                </span>
              </mat-list-item>
              <mat-list-item lines="3" class="f-s-14">
                <span matListItemTitle class="f-s-16 f-w-600">Title</span>
                <span class="f-s-14"
                  >Secondary line that will wrap because the list lines is
                  explicitly set to 3 lines. Text inside of a 'matListItemTitle'
                  or 'matListItemLine' will never wrap.
                </span>
              </mat-list-item>
            </mat-list>
`;

export const LIST_SELECTION_HTML_SNIPPET = `  <mat-selection-list #shoes>
                @for(shoe of typesOfShoes; track shoe) {
                <mat-list-option>
                  {{ shoe }}
                </mat-list-option>
                }
              </mat-selection-list>
  
              <p class="f-s-14 f-w-600 p-16 bg-light-primary rounded">
                Options selected: {{ shoes.selectedOptions.selected.length }}
              </p>
`;

export const LIST_SINGLE_SELECTION_HTML_SNIPPET = `  <mat-selection-list #shoes2 [multiple]="false">
                @for(shoe of typesOfShoes; track shoe) {
                <mat-list-option [value]="shoe">
                  {{ shoe }}
                </mat-list-option>
                }
              </mat-selection-list>
  
              <p class="f-s-14 f-w-600 p-16 bg-light-primary rounded">
                Option selected:
                {{
                  shoes2.selectedOptions.hasValue()
                    ? shoes2.selectedOptions.selected[0].value
                    : "None"
                }}
              </p>
`;

export const LIST_SECTIONS_HTML_SNIPPET = `  <mat-list>
                <div mat-subheader class="f-s-16 m-b-16 f-w-600">Folders</div>
                @for(folder of folders; track folder.name) {
                <mat-list-item>
                  <mat-icon matListItemIcon>folder</mat-icon>
                  <div matListItemTitle class="f-s-16 f-w-600">
                    {{ folder.name }}
                  </div>
                  <div matListItemLine class="f-s-14">
                    {{ folder.updated | date }}
                  </div>
                </mat-list-item>
                }
  
                <mat-divider></mat-divider>
                <div mat-subheader class="f-s-16 m-y-16 f-w-600">Notes</div>
                @for(note of notes; track note.name) {
                <mat-list-item>
                  <mat-icon matListItemIcon>note</mat-icon>
                  <div matListItemTitle class="f-s-16 f-w-600">
                    {{ note.name }}
                  </div>
                  <div matListItemLine class="f-s-14">
                    {{ note.updated | date }}
                  </div>
                </mat-list-item>
                }
              </mat-list>
`;