export const PROGRESS_DETERMINATE_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatProgressBarModule} from '@angular/material/progress-bar';

    /**
     * @title Divider Progress
     */
    @Component({
      selector: 'app-progress',
        imports: [MatProgressBarModule],
        templateUrl: './progress.component.html'
    })
    export class AppProgressComponent {
        constructor() {}
    }
`;

export const PROGRESS_CONFIGURABLE_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {ProgressBarMode, MatProgressBarModule} from '@angular/material/progress-bar';
    import {MatSliderModule} from '@angular/material/slider';
    import {FormsModule} from '@angular/forms';
    import {MatRadioModule} from '@angular/material/radio';
    import {MatCardModule} from '@angular/material/card';

    /**
     * @title Divider Progress
     */
    @Component({
      selector: 'app-progress',
        imports: [MatCardModule, MatRadioModule, FormsModule, MatSliderModule, MatProgressBarModule],
        templateUrl: './progress.component.html'
    })
    export class AppProgressComponent {
        constructor() {}

        mode: ProgressBarMode = 'determinate';
        value = 50;
        bufferValue = 75;
        
    }
`;