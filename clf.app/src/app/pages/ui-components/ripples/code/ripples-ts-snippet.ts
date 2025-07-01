export const RIPPLES_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatRippleModule} from '@angular/material/core';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';
    import {FormsModule} from '@angular/forms';
    import { MatCardModule } from '@angular/material/card';
    import {MatCheckboxModule} from '@angular/material/checkbox';

    /**
     * @title Divider Progress snipper
     */
    @Component({
      selector: 'app-ripples',
        imports: [MatCheckboxModule, FormsModule, MatFormFieldModule, MatInputModule, MatRippleModule, MatCardModule],
        templateUrl: './ripples.component.html',
        styleUrls: ['./ripples.component.scss']
    })
    export class AppRipplesComponent {
        constructor() {}

        centered = false;
        disabled = false;
        unbounded = false;

        radius: number;
        color: string;

    }
`;