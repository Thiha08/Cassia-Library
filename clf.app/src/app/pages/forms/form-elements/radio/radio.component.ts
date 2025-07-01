import { Component } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { BASIC_RADIO_TS_SNIPPET, NG_NODEL_RADIO_TS_SNIPPET } from './code/radio-ts-snippet';
import { BASIC_RADIO_HTML_SNIPPET, NG_NODEL_RADIO_HTML_SNIPPET } from './code/radio-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-radio',
    imports: [MaterialModule, FormsModule, ReactiveFormsModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './radio.component.html'
})
export class AppRadioComponent {
  constructor() {}

  // 1 [Basic with Radio]
  codeForBasicRadio = BASIC_RADIO_HTML_SNIPPET;
  codeForBasicRadioTs = BASIC_RADIO_TS_SNIPPET;

  // 2 [ngModel with Radio]
  codeForngModelRadio = NG_NODEL_RADIO_HTML_SNIPPET;
  codeForngModelRadioTs = NG_NODEL_RADIO_TS_SNIPPET;

  //   ngModel
  favoriteSeason: string;
  seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];
}
