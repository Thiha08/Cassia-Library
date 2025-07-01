export const BASIC_TOOLBAR_TS_SNIPPET = `  import {Component, inject} from '@angular/core';
    import {MatIconModule} from '@angular/material/icon';
    import {MatButtonModule} from '@angular/material/button';
    import {MatToolbarModule} from '@angular/material/toolbar';

    /**
     * @title Basic toolbar
     */
    @Component({
        selector: 'app-toolbar',
        imports: [MatToolbarModule, MatButtonModule, MatIconModule],
        templateUrl: './toolbar.component.html'
    })

    export class AppToolbarComponent {
        constructor() {}
    }
`;