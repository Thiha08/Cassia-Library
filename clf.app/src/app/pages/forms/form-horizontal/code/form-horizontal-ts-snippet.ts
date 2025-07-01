export const BASIC_LAYOUT_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-form-horizontal',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './form-horizontal.component.html',
})
export class AppFormHorizontalComponent {
  constructor() {}
 
}

`;

export const BASIC_WITH_ICONS_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-form-horizontal',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    TablerIconsModule
  ],
  templateUrl: './form-horizontal.component.html',
})
export class AppFormHorizontalComponent {
  constructor() {}
 
}

`;

export const FORM_SEPARATOR_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-form-horizontal',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    TablerIconsModule,
    MatDatepickerModule
  ],
  templateUrl: './form-horizontal.component.html',
  providers: [provideNativeDateAdapter()],
})
export class AppFormHorizontalComponent {
  constructor() {}
 
}

`;

export const COLLAPSE_FORM_TS_SNIPPET = `  import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-form-horizontal',
  imports: [
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    TablerIconsModule,
    MatDatepickerModule
  ],
  templateUrl: './form-horizontal.component.html',
  providers: [provideNativeDateAdapter()],
})
export class AppFormHorizontalComponent {
  constructor() {}

   step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  panelOpenState = false;
 
}

`;
