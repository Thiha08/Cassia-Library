import { Component, signal } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AppCodeViewComponent } from '../../../components/code-view/code-view.component';

// snippets
import {
  ORDINARY_FORM_TS_SNIPPET,
  INPUT_VARIANTS_TS_SNIPPET,
  DEFAULT_FORM_TS_SNIPPET,
  BASIC_HEADER_TS_SNIPPET,
  DISABLED_FORM_TS_SNIPPET,
  LEFT_ICON_TS_SNIPPET,
  RIGHT_ICON_TS_SNIPPET,
} from './code/form-layout-ts-snippet';
import {
  ORDINARY_FORM_HTML_SNIPPET,
  INPUT_VARIANTS_HTML_SNIPPET,
  DEFAULT_FORM_HTML_SNIPPET,
  BASIC_HEADER_HTML_SNIPPET,
  DISABLED_FORM_HTML_SNIPPET,
  LEFT_ICON_HTML_SNIPPET,
  RIGHT_ICON_HTML_SNIPPET,
} from './code/form-layout-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

import { merge } from 'rxjs';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-form-layouts',
  imports: [
    MaterialModule,
    TablerIconsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    AppCodeViewComponent,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './form-layouts.component.html',
  providers: [provideNativeDateAdapter()],
})
export class AppFormLayoutsComponent {
  readonly email = new FormControl('', [Validators.required, Validators.email]);

  errorMessage = signal('');

  constructor() {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  foods: Food[] = [
    { value: 'steak-0', viewValue: 'One' },
    { value: 'pizza-1', viewValue: 'Two' },
    { value: 'tacos-2', viewValue: 'Three' },
    { value: 'tacos-3', viewValue: 'Four' },
  ];

  selectedFood = this.foods[2].value;

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }

  // 1 [ordinary form]
  codeForOrdinary = ORDINARY_FORM_HTML_SNIPPET;
  codeForOrdinaryTs = ORDINARY_FORM_TS_SNIPPET;

  // 2 [input variant]
  codeForInputVariant = INPUT_VARIANTS_HTML_SNIPPET;
  codeForInputVariantTs = INPUT_VARIANTS_TS_SNIPPET;

  // 3 [ default form]
  codeForDefaultForm = DEFAULT_FORM_HTML_SNIPPET;
  codeForDefaultFormTs = DEFAULT_FORM_TS_SNIPPET;

  // 4 [Basic header form]
  codeForBasicHeader = BASIC_HEADER_HTML_SNIPPET;
  codeForBasicHeaderTs = BASIC_HEADER_TS_SNIPPET;

  // 5 [ disabled form]
  codeForDisabledForm = DISABLED_FORM_HTML_SNIPPET;
  codeForDisabledFormTs = DISABLED_FORM_TS_SNIPPET;

  // 6 [ form left icon]
  codeForLeftIcon = LEFT_ICON_HTML_SNIPPET;
  codeForLeftIconTs = LEFT_ICON_TS_SNIPPET;

  // 6 [ form right icon]
  codeForRightIcon = RIGHT_ICON_HTML_SNIPPET;
  codeForRightIconTs = RIGHT_ICON_TS_SNIPPET;
}
