import { Component, OnInit, inject } from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {
  MatSlideToggleModule,
  _MatSlideToggleRequiredValidatorModule,
} from '@angular/material/slide-toggle'; 
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { BASIC_SLIDE_TOGGLE_HTML_SNIPPET, CONFIGURATION_SLIDE_TOGGLE_HTML_SNIPPET, FORM_SLIDE_TOGGLE_HTML_SNIPPET } from './code/slide-toggle-html-snippet';
import { BASIC_SLIDE_TOGGLE_TS_SNIPPET, CONFIGURATION_SLIDE_TOGGLE_TS_SNIPPET, FORM_SLIDE_TOGGLE_TS_SNIPPET } from './code/slide-toggle-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-slide-toggle',
    imports: [MatCardModule, MatRadioModule, FormsModule, MatCheckboxModule, MatSlideToggleModule, ReactiveFormsModule, MatButtonModule,
      _MatSlideToggleRequiredValidatorModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './slide-toggle.component.html'
})
export class AppSlideToggleComponent implements OnInit {

  // 1 [Basic with Slide Toggle]
  codeForSlideToggleBasic = BASIC_SLIDE_TOGGLE_HTML_SNIPPET;
  codeForSlideToggleBasicTs = BASIC_SLIDE_TOGGLE_TS_SNIPPET;

  // 2 [Form with Slide Toggle]
  codeForSlideToggleForm = FORM_SLIDE_TOGGLE_HTML_SNIPPET;
  codeForSlideToggleFormTs = FORM_SLIDE_TOGGLE_TS_SNIPPET;

  // 3 [Configuration with Slide Toggle]
  codeForSlideToggleConfiguration = CONFIGURATION_SLIDE_TOGGLE_HTML_SNIPPET;
  codeForSlideToggleConfigurationTs = CONFIGURATION_SLIDE_TOGGLE_TS_SNIPPET;

  // configuration
  checked = false;
  disabled = false;

  private _formBuilder = inject(FormBuilder);

  isChecked = true;
  formGroup = this._formBuilder.group({
      enableWifi: '',
      acceptTerms: ['', Validators.requiredTrue],
  });

  alertFormValues(formGroup: FormGroup) {
      alert(JSON.stringify(formGroup.value, null, 2));
  }

  ngOnInit(): void {}
}
