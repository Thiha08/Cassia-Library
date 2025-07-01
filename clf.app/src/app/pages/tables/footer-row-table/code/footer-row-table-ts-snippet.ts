export const FOOTER_ROW_TABLE_TS_SNIPPET = `  import { Component, OnInit } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { MatTableModule } from '@angular/material/table';
    import { MatCardModule } from '@angular/material/card';
    import { MatDividerModule } from '@angular/material/divider';


    export interface Transaction {
      item: string;
      img: string;
      cost: number;
    }

    const ELEMENT_DATA: productsData[] = [
      {
        id: 1,
        imagePath: 'assets/images/profile/user-1.jpg',
        uname: 'Sunil Joshi',
        position: 'Web Designer',
        productName: 'Elite Admin',
        budget: 3.9,
        priority: 'low',
      },
      {
        id: 2,
        imagePath: 'assets/images/profile/user-2.jpg',
        uname: 'Andrew McDownland',
        position: 'Project Manager',
        productName: 'Real Homes Theme',
        budget: 24.5,
        priority: 'medium',
      },
      {
        id: 3,
        imagePath: 'assets/images/profile/user-3.jpg',
        uname: 'Christopher Jamil',
        position: 'Project Manager',
        productName: 'MedicalPro Theme',
        budget: 12.8,
        priority: 'high',
      },
      {
        id: 4,
        imagePath: 'assets/images/profile/user-4.jpg',
        uname: 'Nirav Joshi',
        position: 'Frontend Engineer',
        productName: 'Hosting Press HTML',
        budget: 2.4,
        priority: 'critical',
      },
    ];

    /**
     * @title expand table */
     */
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
    export class AppFooterRowTableComponent {

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

    }
`;