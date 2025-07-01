import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { AppCodeViewComponent } from '../../../components/code-view/code-view.component';
import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

// snippets
import { BASIC_FORM_WIZARD_TS_SNIPPET } from './code/form-wizard-ts-snippet';
import {
  BASIC_FORM_WIZARD_HTML_SNIPPET,
  VERTICAL_FORM_WIZARD_HTML_SNIPPET,
} from './code/form-wizard-html-snippet';

@Component({
  selector: 'app-form-wizard',
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppCodeViewComponent,
    HighlightLineNumbers,
    Highlight,
    HighlightAuto,
  ],
  templateUrl: './form-wizard.component.html',
})
export class AppFormWizardComponent {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  constructor(private _formBuilder: FormBuilder) {}

  // 1 [basic form wizard]
  codeForFormWizard = BASIC_FORM_WIZARD_HTML_SNIPPET;
  codeForFormWizardTs = BASIC_FORM_WIZARD_TS_SNIPPET;

  // 2 [ vertical form wizard]
  codeForVerticalFormWizard = VERTICAL_FORM_WIZARD_HTML_SNIPPET;
  codeForVerticalFormWizardTs = BASIC_FORM_WIZARD_TS_SNIPPET;
}
