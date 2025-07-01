export const DIVIDER_BASIC_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatDividerModule} from '@angular/material/divider';
    import { MatListModule } from '@angular/material/list';

    /**
     * @title Divider overview
     */
    @Component({
        selector: 'app-divider',
        imports: [MatDividerModule, MatListModule, MatCardModule],
        templateUrl: './divider.component.html'
    })
    export class AppDividerComponent {
        
    }
`;