export const MENU_BASIC_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatButtonModule } from '@angular/material/button';
    import { MatIconModule } from '@angular/material/icon';
    import { MatMenuModule } from '@angular/material/menu';

    /**
     * @title Divider menu
     */
    @Component({
        selector: 'app-menu',
        imports: [ MatMenuModule, MatIconModule, MatButtonModule],
        templateUrl: './menu.component.html'
    })
    export class AppMenuComponent {
        constructor() {}
    }
`;