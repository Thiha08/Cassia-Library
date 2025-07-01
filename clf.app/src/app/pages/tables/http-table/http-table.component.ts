import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { HTTP_TABLE_HTML_SNIPPET } from './code/http-table-html-snippet';
import { HTTP_TABLE_TS_SNIPPET } from './code/http-table-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  selector: 'app-http-table',
  imports: [
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    CommonModule,
    TablerIconsModule,
    MatSortModule,
    MatDividerModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    AppCodeViewComponent,
  ],
  templateUrl: './http-table.component.html',
  styleUrls: ['./http-table.component.scss'],
})
export class AppHttpTableComponent {
  // 1 [Http Row with Table]
  codeForHttpRowTable = HTTP_TABLE_HTML_SNIPPET;
  codeForHttpRowTableTs = HTTP_TABLE_TS_SNIPPET;

  displayedColumns: string[] = ['created', 'state', 'number', 'title'];
  exampleDatabase: ExampleHttpDatabase | null = null;
  data: GithubIssue[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  // tslint:disable-next-line - Disables all
  constructor(private _httpClient: HttpClient) {}

  ngAfterViewInit(): void {
    this.exampleDatabase = new ExampleHttpDatabase(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          // tslint:disable-next-line - Disables all
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex
          );
        }),
        map((data) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;

          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      )
      .subscribe((data) => (this.data = data));
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
  // tslint:disable-next-line - Disables all
  constructor(private _httpClient: HttpClient) {}

  getRepoIssues(
    sort: string,
    order: string,
    page: number
  ): Observable<GithubApi> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
      page + 1
    }`;

    return this._httpClient.get<GithubApi>(requestUrl);
  }
}
