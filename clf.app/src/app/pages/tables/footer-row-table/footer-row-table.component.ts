import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { FOOTER_ROW_TABLE_HTML_SNIPPET } from './code/footer-row-table-html-snippet';
import { FOOTER_ROW_TABLE_TS_SNIPPET } from './code/footer-row-table-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';


export interface Transaction {
  item: string;
  img: string;
  cost: number;
}
@Component({
  selector: 'app-footer-row-table',
  imports: [MatTableModule, MatCardModule, CommonModule, MatDividerModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    AppCodeViewComponent,
  ],
  templateUrl: './footer-row-table.component.html',
  styleUrls: ['./footer-row-table.component.scss'],
})
export class AppFooterRowTableComponent implements OnInit {
  // 1 [Footer Row with Table]
  codeForFooterRowTable = FOOTER_ROW_TABLE_HTML_SNIPPET;
  codeForFooterRowTableTs = FOOTER_ROW_TABLE_TS_SNIPPET;


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
  getTotalCost() {
    return this.transactions
      .map((t) => t.cost)
      .reduce((acc, value) => acc + value, 0);
  }

  constructor() {}

  ngOnInit(): void {}
}
