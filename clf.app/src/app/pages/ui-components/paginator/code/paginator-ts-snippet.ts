export const PAGINATOR_BASIC_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatPaginatorModule} from '@angular/material/paginator';
    import {JsonPipe} from '@angular/common';
    import {MatSlideToggleModule} from '@angular/material/slide-toggle';
    import {FormsModule} from '@angular/forms';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Divider paginator
     */
    @Component({
      selector: 'app-paginator',
        imports: [
            MatFormFieldModule,
            MatInputModule,
            FormsModule,
            MatSlideToggleModule,
            MatPaginatorModule,
            JsonPipe,
        ],
        templateUrl: './paginator.component.html'
    })
    export class AppPaginatorComponent {
        constructor() {}
    }
`;