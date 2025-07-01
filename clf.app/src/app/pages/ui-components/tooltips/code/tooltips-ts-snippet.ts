export const BASIC_TOOLTIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatTooltipModule} from '@angular/material/tooltip';
    import {MatButtonModule} from '@angular/material/button';

    /**
     * @title Basic tooltip
     */
    @Component({
        selector: 'app-tooltips',
        imports: [MatButtonModule, MatTooltipModule],
        templateUrl: './tooltips.component.html'
    })

    export class AppTooltipsComponent {
        constructor() {}
    }
`;

export const DISABLED_CLICK_TOOLTIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {MatCheckboxModule} from '@angular/material/checkbox';
    import {MatTooltipModule} from '@angular/material/tooltip';
    import {MatButtonModule} from '@angular/material/button';

    /**
     * @title Tooltip that can be disabled
     */
    @Component({
        selector: 'app-tooltips',
        imports: [MatButtonModule, MatTooltipModule, MatCheckboxModule, FormsModule, ReactiveFormsModule],
        templateUrl: './tooltips.component.html'
    })

    export class AppTooltipsComponent {
        constructor() {}

        disabled = new FormControl(false);
    }
`;

export const SHOW_AND_HIDE_TOOLTIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {MatTooltipModule} from '@angular/material/tooltip';
    import {MatButtonModule} from '@angular/material/button';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Tooltip with a show and hide delay
     */
    @Component({
        selector: 'app-tooltips',
        imports: [
            MatFormFieldModule,
            MatInputModule,
            FormsModule,
            ReactiveFormsModule,
            MatButtonModule,
            MatTooltipModule,
        ],
        templateUrl: './tooltips.component.html'
    })

    export class AppTooltipsComponent {
        constructor() {}

        showDelay = new FormControl(1000);
        hideDelay = new FormControl(2000);
    }
`;

export const CHANGE_MESSAGE_TOOLTIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {MatTooltipModule} from '@angular/material/tooltip';
    import {MatButtonModule} from '@angular/material/button';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Tooltip with a changing message
     */
    @Component({
        selector: 'app-tooltips',
        imports: [
            MatFormFieldModule,
            MatInputModule,
            FormsModule,
            ReactiveFormsModule,
            MatButtonModule,
            MatTooltipModule,
        ],
        templateUrl: './tooltips.component.html'
    })

    export class AppTooltipsComponent {
        constructor() {}

        message = new FormControl('Info about the action');
    }
`;