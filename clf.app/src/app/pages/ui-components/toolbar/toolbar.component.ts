import { Component, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { BASIC_TOOLBAR_HTML_SNIPPET, MULTI_ROW_TOOLBAR_HTML_SNIPPET, ONLY_BRAND_TOOLBAR_HTML_SNIPPET } from './code/toolbar-html-snippet';
import { BASIC_TOOLBAR_TS_SNIPPET } from './code/toolbar-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-toolbar',
    imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule, TablerIconsModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './toolbar.component.html'
})
export class AppToolbarComponent implements OnInit {
  constructor() {}

  // 1 [basic with toolbar]
  codeForToolbarBasic = BASIC_TOOLBAR_HTML_SNIPPET;
  codeForToolbarBasicTs = BASIC_TOOLBAR_TS_SNIPPET;

  // 2 [Multi Row with toolbar]
  codeForToolbarMultiRow = MULTI_ROW_TOOLBAR_HTML_SNIPPET;
  codeForToolbarMultiRowTs = BASIC_TOOLBAR_TS_SNIPPET;

  // 3 [Only Brand with toolbar]
  codeForToolbarOnlyBrand = ONLY_BRAND_TOOLBAR_HTML_SNIPPET;
  codeForToolbarOnlyBrandTs = BASIC_TOOLBAR_TS_SNIPPET;

  ngOnInit(): void {}
}
