export const ORDINARY_FORM_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';


@Component({
  selector: 'app-form-layouts',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './form-layouts.component.html',
})
export class AppFormLayoutsComponent {
  constructor() {}
 
}

`;

export const INPUT_VARIANTS_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {merge} from 'rxjs';

/** @title Form field with error messages */
@Component({
  selector: 'form-layout',
  templateUrl: 'form-layout.html',
  styleUrl: 'form-layout.css',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFormLayoutComponent {
  readonly email = new FormControl('', [Validators.required, Validators.email]);

  errorMessage = signal('');

  constructor() {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }
}

`;

export const DEFAULT_FORM_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';


@Component({
  selector: 'app-form-layouts',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule, 
    MatRadioModule
  ],
  templateUrl: './form-layouts.component.html',
})
export class AppFormLayoutsComponent {
  constructor() {}

   foods: Food[] = [
    { value: 'steak-0', viewValue: 'One' },
    { value: 'pizza-1', viewValue: 'Two' },
    { value: 'tacos-2', viewValue: 'Three' },
    { value: 'tacos-3', viewValue: 'Four' },
  ];

  selectedFood = this.foods[2].value;
 
}

`;

export const BASIC_HEADER_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';


@Component({
  selector: 'app-form-layouts',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule, 
    MatRadioModule, MatDatepickerModule
  ],
  templateUrl: './form-layouts.component.html',
  providers: [provideNativeDateAdapter()],
})
export class AppFormLayoutsComponent {
  constructor() {}

   foods: Food[] = [
    { value: 'steak-0', viewValue: 'One' },
    { value: 'pizza-1', viewValue: 'Two' },
    { value: 'tacos-2', viewValue: 'Three' },
    { value: 'tacos-3', viewValue: 'Four' },
  ];

  selectedFood = this.foods[2].value;
 
}

`;

export const DISABLED_FORM_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';


@Component({
  selector: 'app-form-layouts',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './form-layouts.component.html',
})
export class AppFormLayoutsComponent {
  constructor() {}
 
}

`;

export const LEFT_ICON_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-form-layouts',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    TablerIconsModule
  ],
  templateUrl: './form-layouts.component.html',
})
export class AppFormLayoutsComponent {
  constructor() {}
 
}

`;

export const RIGHT_ICON_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-form-layouts',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    TablerIconsModule
  ],
  templateUrl: './form-layouts.component.html',
})
export class AppFormLayoutsComponent {
  constructor() {}
 
}

`;
