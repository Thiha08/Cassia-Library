import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { ROW_CONTEXT_TABLE_HTML_SNIPPET } from './code/row-context-table-html-snippet';
import { ROW_CONTEXT_TABLE_TS_SNIPPET } from './code/row-context-table-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  selector: 'app-row-context-table',
  imports: [MatCardModule, MatTableModule, MatDividerModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    AppCodeViewComponent,
  ],
  templateUrl: './row-context-table.component.html',
})
export class AppRowContextTableComponent implements OnInit {
  // 1 [Row Context with Table]
  codeForRowContextTable = ROW_CONTEXT_TABLE_HTML_SNIPPET;
  codeForRowContextTableTs = ROW_CONTEXT_TABLE_TS_SNIPPET;

  displayedColumns: string[] = [
    '$implicit',
    'index',
    'count',
    'first',
    'last',
    'even',
    'odd',
  ];
  data: string[] = ['one', 'two', 'three', 'four', 'five'];

  constructor() {}

  ngOnInit(): void {}
}
