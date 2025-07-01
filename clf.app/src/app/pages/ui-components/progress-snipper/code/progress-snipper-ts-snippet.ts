export const PROGRESS_SPINNER_BASIC_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

    /**
     * @title Divider Progress snipper
     */
    @Component({
      selector: 'app-progress-snipper',
          imports: [MatProgressSpinnerModule],
          templateUrl: './progress-snipper.component.html'
    })
    export class AppProgressSnipperComponent {
        constructor() {}
    }
`;

export const PROGRESS_SPINNER_CONFIGURABLE_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

    /**
     * @title Divider Progress snipper
     */
    @Component({
      selector: 'app-progress-snipper',
        imports: [MatCardModule, MatRadioModule, FormsModule, MatSliderModule, MatProgressSpinnerModule],
        templateUrl: './progress-snipper.component.html'
    })
    export class AppProgressSnipperComponent {
        constructor() {}

        mode: ProgressSpinnerMode = 'determinate';
        value = 50;

    }
`;