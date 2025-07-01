import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';


// snippets
import { PROGRESS_BUFFER_HTML_SNIPPET, PROGRESS_CONFIGURABLE_HTML_SNIPPET, PROGRESS_DETERMINATE_HTML_SNIPPET, PROGRESS_INDETERMINATE_HTML_SNIPPET, PROGRESS_QUERY_HTML_SNIPPET } from './code/progress-html-snippet';
import { PROGRESS_CONFIGURABLE_TS_SNIPPET, PROGRESS_DETERMINATE_TS_SNIPPET } from './code/progress-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-progress',
    imports: [MatProgressBarModule, MatCardModule, FormsModule, MatSliderModule, MatRadioModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './progress.component.html'
})

export class AppProgressComponent implements OnInit {

  // 1 [determinate with Progress]
  codeForProgressDeterminate = PROGRESS_DETERMINATE_HTML_SNIPPET;
  codeForProgressDeterminateTs = PROGRESS_DETERMINATE_TS_SNIPPET;

  // 2 [Indeterminate with Progress]
  codeForProgressIndeterminate = PROGRESS_INDETERMINATE_HTML_SNIPPET;
  codeForProgressIndeterminateTs = PROGRESS_DETERMINATE_TS_SNIPPET;

  // 3 [Query with Progress]
  codeForProgressQuery = PROGRESS_QUERY_HTML_SNIPPET;
  codeForProgressQueryTs = PROGRESS_DETERMINATE_TS_SNIPPET;

  // 4 [Buffer with Progress]
  codeForProgressBuffer = PROGRESS_BUFFER_HTML_SNIPPET;
  codeForProgressBufferTs = PROGRESS_DETERMINATE_TS_SNIPPET;

  // 5 [Configurable with Progress]
  codeForProgressConfigurable = PROGRESS_CONFIGURABLE_HTML_SNIPPET;
  codeForProgressConfigurableTs = PROGRESS_CONFIGURABLE_TS_SNIPPET;


  mode: ProgressBarMode = 'determinate';
  value = 50;
  bufferValue = 75;

  constructor() {}

  ngOnInit(): void {}
}
