export const ROW_CONTEXT_TABLE_TS_SNIPPET = `  import { Component, OnInit } from '@angular/core';
    import { MatCardModule } from '@angular/material/card';
    import { MatDividerModule } from '@angular/material/divider';
    import { MatTableModule } from '@angular/material/table';


    /**
     * @title Row Context table */
     */
    @Component({
      selector: 'app-row-context-table',
      imports: [MatCardModule, MatTableModule, MatDividerModule],
      templateUrl: './row-context-table.component.html',
    })
    export class AppRowContextTableComponent {

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
    }
`;
