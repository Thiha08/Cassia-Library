export const LIST_BASIC_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatListModule } from '@angular/material/list';

    /**
     * @title List overview
     */
    @Component({
        selector: 'app-lists',
        imports: [MatListModule],
        templateUrl: './lists.component.html'
    })
    export class AppListsComponent {
        
    }
`;


export const LIST_SELECTION_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatListModule } from '@angular/material/list';
    import { MaterialModule } from 'src/app/material.module';
    import {DatePipe} from '@angular/common';

    /**
     * @title List overview
     */
    @Component({
        selector: 'app-lists',
        imports: [MatListModule, MaterialModule, DatePipe],
        templateUrl: './lists.component.html'
    })
    export class AppListsComponent {
        typesOfShoes: string[] = ['Loafers', 'Sneakers'];
    }
`;


export const LIST_SECTIONS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatListModule } from '@angular/material/list';
    import { MaterialModule } from 'src/app/material.module';
    import {DatePipe} from '@angular/common';

    export interface Section {
        name: string;
        updated: Date;
    }
    
    /**
     * @title List overview
     */
    @Component({
        selector: 'app-lists',
        imports: [MatListModule, MaterialModule, DatePipe],
        templateUrl: './lists.component.html'
    })
    export class AppListsComponent {
        typesOfShoes: string[] = ['Loafers', 'Sneakers'];

        folders: Section[] = [
            {
              name: 'Photos',
              updated: new Date('1/1/16'),
            },
            {
              name: 'Recipes',
              updated: new Date('1/17/16'),
            },
            {
              name: 'Work',
              updated: new Date('1/28/16'),
            },
          ];
          notes: Section[] = [
            {
              name: 'Vacation Itinerary',
              updated: new Date('2/20/16'),
            },
            {
              name: 'Kitchen Remodel',
              updated: new Date('1/18/16'),
            },
          ];
    }
`;