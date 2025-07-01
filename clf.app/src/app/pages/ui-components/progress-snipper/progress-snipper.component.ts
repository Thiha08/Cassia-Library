import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ThemePalette } from '@angular/material/core';
import { MatProgressSpinnerModule, ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { PROGRESS_SPINNER_BASIC_HTML_SNIPPET, PROGRESS_SPINNER_CONFIGURABLE_HTML_SNIPPET } from './code/progress-snipper-html-snippet';
import { PROGRESS_SPINNER_BASIC_TS_SNIPPET, PROGRESS_SPINNER_CONFIGURABLE_TS_SNIPPET } from './code/progress-snipper-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';


@Component({
    selector: 'app-progress-snipper',
    imports: [MatCardModule, MatRadioModule, FormsModule, MatSliderModule, MatProgressSpinnerModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './progress-snipper.component.html'
})
export class AppProgressSnipperComponent implements OnInit { 

  // 1 [Basic with Progress spinner]
  codeForProgressSpinnerBasic = PROGRESS_SPINNER_BASIC_HTML_SNIPPET;
  codeForProgressSpinnerBasicTs = PROGRESS_SPINNER_BASIC_TS_SNIPPET;

  // 2 [Basic with Progress spinner]
  codeForProgressSpinnerConfigurable = PROGRESS_SPINNER_CONFIGURABLE_HTML_SNIPPET;
  codeForProgressSpinnerConfigurableTs = PROGRESS_SPINNER_CONFIGURABLE_TS_SNIPPET;

  constructor() {}

  ngOnInit(): void {}

  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
}
