import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';

import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { MULTI_HEADER_FOOTER_TABLE_HTML_SNIPPET } from './code/multi-header-footer-table-html-snippet';
import { MULTI_HEADER_FOOTER_TABLE_TS_SNIPPET } from './code/multi-header-footer-table-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

export interface Transaction {
  item: string;
  img: string;
  cost: number;
}

@Component({
  selector: 'app-multi-header-footer-table',
  imports: [MatCardModule, MatTableModule, CommonModule, MatDividerModule,
    Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
  ],
  templateUrl: './multi-header-footer-table.component.html',
  styleUrls: ['./multi-header-footer-table.component.scss'],
})
export class AppMultiHeaderFooterTableComponent implements OnInit {
  // 1 [Multi Header Footer with Table]
  codeForMultiHeaderFooterTable = MULTI_HEADER_FOOTER_TABLE_HTML_SNIPPET;
  codeForMultiHeaderFooterTableTs = MULTI_HEADER_FOOTER_TABLE_TS_SNIPPET;

  displayedColumns: string[] = ['item', 'cost'];
  transactions: Transaction[] = [
    { img: '/assets/images/products/s1.jpg', item: 'Beach ball', cost: 4 },
    { img: '/assets/images/products/s2.jpg', item: 'Towel', cost: 5 },
    { img: '/assets/images/products/s3.jpg', item: 'Frisbee', cost: 2 },
    { img: '/assets/images/products/s4.jpg', item: 'Sunscreen', cost: 4 },
    { img: '/assets/images/products/s5.jpg', item: 'Cooler', cost: 25 },
    { img: '/assets/images/products/s6.jpg', item: 'Swim suit', cost: 15 },
  ];

  /** Gets the total cost of all transactions. */
  getTotalCost(): any {
    return this.transactions
      .map((t) => t.cost)
      .reduce((acc, value) => acc + value, 0);
  }

  constructor() {}

  ngOnInit(): void {}
}
