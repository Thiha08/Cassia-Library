import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { SORTABLE_TABLE_HTML_SNIPPET } from './code/sortable-table-html-snippet';
import { SORTABLE_TABLE_TS_SNIPPET } from './code/sortable-table-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

const ELEMENT_DATA: Element[] = [
  {
    id: 1,
    imagePath: 'assets/images/profile/user-1.jpg',
    uname: 'Sunil Joshi',
    position: 'Web Designer',
    name: 'Elite Admin',
    budget: 3.9,
    priority: 'low',
  },
  {
    id: 2,
    imagePath: 'assets/images/profile/user-2.jpg',
    uname: 'Andrew McDownland',
    position: 'Project Manager',
    name: 'Real Homes Theme',
    budget: 24.5,
    priority: 'medium',
  },
  {
    id: 3,
    imagePath: 'assets/images/profile/user-3.jpg',
    uname: 'Christopher Jamil',
    position: 'Project Manager',
    name: 'MedicalPro Theme',
    budget: 12.8,
    priority: 'high',
  },
  {
    id: 4,
    imagePath: 'assets/images/profile/user-4.jpg',
    uname: 'Nirav Joshi',
    position: 'Frontend Engineer',
    name: 'Hosting Press HTML',
    budget: 2.4,
    priority: 'critical',
  },
  {
    id: 5,
    imagePath: 'assets/images/profile/user-1.jpg',
    uname: 'Sunil Joshi',
    position: 'Web Designer',
    name: 'Elite Admin',
    budget: 3.9,
    priority: 'low',
  },
  {
    id: 6,
    imagePath: 'assets/images/profile/user-2.jpg',
    uname: 'Andrew McDownland',
    position: 'Project Manager',
    name: 'Real Homes Theme',
    budget: 24.5,
    priority: 'medium',
  },
];

@Component({
  selector: 'app-sortable-table',
  imports: [MatCardModule, MatTableModule, CommonModule, MatDividerModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    AppCodeViewComponent,
  ],
  templateUrl: './sortable-table.component.html',
})
export class AppSortableTableComponent implements OnInit {
  // 1 [Sortable with Table]
  codeForSortableTable = SORTABLE_TABLE_HTML_SNIPPET;
  codeForSortableTableTs = SORTABLE_TABLE_TS_SNIPPET;

  constructor() {}
  displayedColumns = ['assigned', 'name', 'priority', 'budget'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  @ViewChild(MatSort, { static: true }) sort: MatSort = Object.create(null);

  /**
   * Set the sort after the view init since this component will
   * be able to query its view for the initialized sort.
   */
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {}
}

export interface Element {
  id: number;
  imagePath: string;
  uname: string;
  position: string;
  name: string;
  budget: number;
  priority: string;
}
