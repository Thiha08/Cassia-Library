export const BASIC_CHECKBOX_HTML_SNIPPET = `  <section class="example-section">
          <mat-checkbox class="example-margin">Check me!</mat-checkbox>
          <mat-checkbox class="example-margin" [disabled]="true">Disabled</mat-checkbox>
        </section>
        
        <section class="example-section">
          <span class="example-list-section">
            <mat-checkbox
              class="example-margin"
              [checked]="task().completed"
              [indeterminate]="partiallyComplete()"
              (change)="update($event.checked)"
            >
              {{task().name}}
            </mat-checkbox>
          </span>
          <span class="example-list-section">
            <div class="m-l-24">
              @for (subtask of task().subtasks; track subtask; let i = $index) {
                <div>
                  <mat-checkbox [checked]="subtask.completed" (change)="update($event.checked, i)">
                    {{subtask.name}}
                  </mat-checkbox>
                </div>
              }
            </div>
          </span>
        </section>

`;

export const CONFIGURABLE_CHECKBOX_HTML_SNIPPET = `  <div>
          <label class="f-w-600">Align:</label>
          <mat-radio-group [(ngModel)]="labelPosition">
            <mat-radio-button value="after" color="primary">After</mat-radio-button>
            <mat-radio-button value="before" color="primary">Before</mat-radio-button>
          </mat-radio-group>
        </div>

        <div>
          <mat-checkbox [(ngModel)]="checked" color="primary">Checked</mat-checkbox>
          <mat-checkbox [(ngModel)]="indeterminate" color="primary">Indeterminate</mat-checkbox>
          <mat-checkbox [(ngModel)]="disabled" color="primary">Disabled</mat-checkbox>
        </div>

        <div class="p-24 rounded bg-light m-t-16">
          <h2 class="f-s-16 f-w-600 m-b-16">Result</h2>
          <mat-checkbox [(ngModel)]="checked" color="primary" [(indeterminate)]="indeterminate"
            [labelPosition]="labelPosition" [disabled]="disabled">
            I'm a checkbox
          </mat-checkbox>
        </div>
`;

export const REACTIVE_FORM_CHECKBOX_HTML_SNIPPET = `  <div [formGroup]="toppings">
          <h4 class="f-s-14 f-w-600">Select your toppings:</h4>
          <p>
            <mat-checkbox formControlName="pepperoni" color="primary">Pepperoni</mat-checkbox>
          </p>
          <p>
            <mat-checkbox formControlName="extracheese" color="primary">Extra Cheese</mat-checkbox>
          </p>
          <p>
            <mat-checkbox formControlName="mushroom" color="primary">Mushroom</mat-checkbox>
          </p>
        </div>
        <div class="p-24 rounded bg-light m-t-16" [formGroup]="toppings">
          <h2 class="f-s-16 f-w-600 m-b-16">You chose:</h2>
          {{ toppings.value | json }}
        </div>
`;