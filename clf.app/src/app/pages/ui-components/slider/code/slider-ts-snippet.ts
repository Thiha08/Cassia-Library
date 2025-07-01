export const CONFIGURATION_SLIDER_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatSliderModule} from '@angular/material/slider';
    import {MatCheckboxModule} from '@angular/material/checkbox';
    import {FormsModule} from '@angular/forms';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';
    import {MatCardModule} from '@angular/material/card';

    /**
     * @title Configurable slider
     */
    @Component({
      selector: 'app-slider',
        imports: [
            MatCardModule,
            MatFormFieldModule,
            MatInputModule,
            FormsModule,
            MatCheckboxModule,
            MatSliderModule,
        ],
        templateUrl: './slider.component.html'
    })
    export class AppSliderComponent {
        constructor() {}

        disabled = false;
        max = 100;
        min = 0;
        showTicks = false;
        step = 1;
        thumbLabel = false;
        value = 0;
    }
`;

export const CUSTOM_THUMB_LABEL_SLIDER_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatSliderModule} from '@angular/material/slider';

    /**
     * @title Slider with custom thumb label formatting.
     */
    @Component({
      selector: 'app-slider',
        imports: [MatSliderModule],
        templateUrl: './slider.component.html'
    })
    export class AppSliderComponent {
        constructor() {}

        formatLabel(value: number): string {
        if (value >= 1000) {
            return Math.round(value / 1000) + 'k';
        }

        return '{value}';
        }
    }
`;

export const BASIC_SLIDER_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatSliderModule} from '@angular/material/slider';

    /**
     * @title Basic slider
     */
    @Component({
      selector: 'app-slider',
        imports: [MatSliderModule],
        templateUrl: './slider.component.html'
    })
    export class AppSliderComponent {
        constructor() {}
    }
`;