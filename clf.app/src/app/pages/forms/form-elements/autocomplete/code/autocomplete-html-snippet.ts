export const FIRST_AUTOCOMPLETE_OPTION_HTML_SNIPPET = `  <form>
              <mat-form-field class="w-100" appearance="outline">
                <mat-label>Number</mat-label>
                <input type="text" placeholder="Pick one" aria-label="Number" matInput [formControl]="firstControl"
                  [matAutocomplete]="auto" />
                <mat-autocomplete autoActiveFirstOption #auto="matAutocomplete">
                  @for(firstoption of filteredOptions | async; track
                  firstoption) {
                  <mat-option [value]="firstoption">
                    {{ firstoption }}
                  </mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>
            </form>
`;

export const OPTION_GROUP_HTML_SNIPPET = `  <form [formGroup]="stateForm">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>States Group</mat-label>
                <input type="text" matInput formControlName="stateGroup" required [matAutocomplete]="autoGroup" />
                <mat-autocomplete #autoGroup="matAutocomplete">
                  @for(group of stateGroupOptions | async; track group) {
                  <mat-optgroup [label]="group.letter">
                    @for(name of group.names; track name) {
                    <mat-option [value]="name">
                      {{ name }}
                    </mat-option>
                    }
                  </mat-optgroup>
                  }
                </mat-autocomplete>
              </mat-form-field>
            </form>
`;

export const FILTER_HTML_SNIPPET = `  <form>
              <mat-form-field class="w-100" appearance="outline">
                <mat-label>Number</mat-label>
                <input type="text" placeholder="Pick one" aria-label="Number" matInput [formControl]="filterControl"
                  [matAutocomplete]="auto3" />
                <mat-autocomplete #auto3="matAutocomplete">
                  @for(searchoption of searchfilteredOptions | async; track
                  searchoption) {
                  <mat-option [value]="searchoption">
                    {{ searchoption }}
                  </mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>
            </form>
`;

export const OVERVIEW_HTML_SNIPPET = `  <form>
              <mat-form-field class="w-100" appearance="outline">
                <mat-label>State</mat-label>
                <input matInput aria-label="State" [matAutocomplete]="auto2" [formControl]="stateCtrl" />
                <mat-autocomplete #auto2="matAutocomplete">
                  @for(state of filteredStates | async; track state.name) {
                  <mat-option [value]="state.name" class="d-flex align-items-center">
                    <img alt="" class="m-r-8" [src]="state.flag" height="25" />

                    <span>{{ state.name }}</span> |
                    <small>Population: {{ state.population }}</small>
                  </mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              <br />

              <mat-slide-toggle [checked]="stateCtrl.disabled" (change)="
                  stateCtrl.disabled ? stateCtrl.enable() : stateCtrl.disable()
                ">
                Disable Input?
              </mat-slide-toggle>
            </form>
`;