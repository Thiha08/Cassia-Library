export const MULTI_HEADER_FOOTER_TABLE_TS_SNIPPET = `  import { Component, OnInit } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { MatCardModule } from '@angular/material/card';
    import { MatTableModule } from '@angular/material/table';
    import { MatDividerModule } from '@angular/material/divider';

    export interface Transaction {
      item: string;
      img: string;
      cost: number;
    }

    /**
     * @title multi-header-footer table */
     */
    @Component({
      selector: 'app-multi-header-footer-table',
        imports: [MatCardModule, MatTableModule, CommonModule, MatDividerModule],
        templateUrl: './multi-header-footer-table.component.html',
        styleUrls: ['./multi-header-footer-table.component.scss'],
    })
    export class AppMultiHeaderFooterTableComponent {

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

    }
`;
