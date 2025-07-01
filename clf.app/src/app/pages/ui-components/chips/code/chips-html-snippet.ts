export const BASIC_CHIPS_HTML_SNIPPET = `  <mat-chip-listbox aria-label="Fish selection">
                <mat-chip-option class="f-s-14" color="primary">One fish</mat-chip-option>
                <mat-chip-option class="f-s-14">Two fish</mat-chip-option>
                <mat-chip-option class="f-s-14" color="accent" selected>Accent fish</mat-chip-option>
                <mat-chip-option class="f-s-14" color="warn">Warn fish</mat-chip-option>
              </mat-chip-listbox>
`;

export const AVATAR_CHIPS_HTML_SNIPPET = `   <mat-chip-set aria-label="Dog selection">
                <mat-chip class="f-s-14">
                  <img matChipAvatar src="/assets/images/profile/user-1.jpg" alt="Photo of a Shiba Inu" />
                  Anderson
                </mat-chip>
                <mat-chip class="f-s-14" color="primary">
                  <img matChipAvatar src="/assets/images/profile/user-2.jpg" alt="Photo of a Shiba Inu" />
                  Monty
                </mat-chip>
                <mat-chip class="f-s-14" color="accent">
                  <img matChipAvatar src="/assets/images/profile/user-3.jpg" alt="Photo of a Shiba Inu" />
                  Mathew
                </mat-chip>
              </mat-chip-set>
`;

export const DRAG_DROP_CHIPS_HTML_SNIPPET = `   <mat-chip-set class="example-chip" cdkDropList cdkDropListOrientation="horizontal"
              (cdkDropListDropped)="drop($event)">
              @for (vegetable of vegetables(); track vegetable.name) {
              <mat-chip class="example-box" cdkDrag>{{
                vegetable.name
                }}</mat-chip>
              }
`;

export const STACKED_CHIPS_HTML_SNIPPET = `   <mat-chip-listbox class="mat-mdc-chip-set-stacked" aria-label="Cutest dog breeds">
  @for (dog of bestBoys; track dog) {
    <mat-chip-option selected>{{dog}}</mat-chip-option>
  }
</mat-chip-listbox>
`;

export const INPUT_CHIPS_HTML_SNIPPET = `   <mat-form-field appearance="outline" class="w-100">
                <mat-label>Favorite Fruits</mat-label>
                <mat-chip-grid #chipGrid aria-label="Enter fruits">
                  @for(fruit of fruits; track fruit.name) {
                  <mat-chip-row (removed)="remove(fruit)" [editable]="true" (edited)="edit(fruit, $event)"
                    [aria-description]="'press enter to edit ' + fruit.name" class="f-s-14">
                    {{ fruit.name }}
                    <button matChipRemove [attr.aria-label]="'remove ' + fruit.name">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip-row>
                  }
  
                  <input placeholder="New fruit..." [matChipInputFor]="chipGrid"
                    [matChipInputSeparatorKeyCodes]="separatorKeysCodes" [matChipInputAddOnBlur]="addOnBlur"
                    (matChipInputTokenEnd)="add($event)" />
                </mat-chip-grid>
              </mat-form-field>
`;

export const FORM_CONTROL_CHIPS_HTML_SNIPPET = `   <mat-form-field appearance="outline" class="w-100">
                <mat-label>Favorite Fruits</mat-label>
                <mat-chip-grid #chipGrid aria-label="Enter fruits">
                  @for(fruit of fruits; track fruit.name) {
                  <mat-chip-row (removed)="remove(fruit)" [editable]="true" (edited)="edit(fruit, $event)"
                    [aria-description]="'press enter to edit ' + fruit.name" class="f-s-14">
                    {{ fruit.name }}
                    <button matChipRemove [attr.aria-label]="'remove ' + fruit.name">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip-row>
                  }
  
                  <input placeholder="New fruit..." [matChipInputFor]="chipGrid"
                    [matChipInputSeparatorKeyCodes]="separatorKeysCodes" [matChipInputAddOnBlur]="addOnBlur"
                    (matChipInputTokenEnd)="add($event)" />
                </mat-chip-grid>
              </mat-form-field>
`;