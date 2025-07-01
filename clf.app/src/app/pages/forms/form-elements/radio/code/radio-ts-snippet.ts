export const BASIC_RADIO_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatRadioModule} from '@angular/material/radio';

    /**
     * @title Basic radios
     */
    @Component({
        selector: 'app-radio',
        imports: [MatRadioModule],
        templateUrl: './radio.component.html'
    })
    export class AppRadioComponent {
        constructor() {}
    }
`;

export const NG_NODEL_RADIO_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {FormsModule} from '@angular/forms';
    import {MatRadioModule} from '@angular/material/radio';

    /**
     * @title Radios with ngModel
     */
    @Component({
        selector: 'app-radio',
        imports: [MatRadioModule, FormsModule],
        templateUrl: './radio.component.html'
    })
    export class AppRadioComponent {
        constructor() {}

        favoriteSeason: string;
        seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];
    }
`;