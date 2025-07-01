import { Component } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { JsonPipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { PAGINATOR_BASIC_HTML_SNIPPET } from './code/paginator-html-snippet';
import { PAGINATOR_BASIC_TS_SNIPPET } from './code/paginator-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  selector: 'app-paginator',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatCardModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    AppCodeViewComponent,
  ],
  templateUrl: './paginator.component.html',
})
export class AppPaginatorComponent {
  constructor() {}

  // 1 [basic with paginator]
  codeForPaginatorBasic = PAGINATOR_BASIC_HTML_SNIPPET;
  codeForPaginatorBasicTs = PAGINATOR_BASIC_TS_SNIPPET;
}
