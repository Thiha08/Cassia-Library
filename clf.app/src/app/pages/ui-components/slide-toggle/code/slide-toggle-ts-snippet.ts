export const BASIC_SLIDE_TOGGLE_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatSlideToggleModule} from '@angular/material/slide-toggle';

    /**
     * @title slide-toggle
     */
    @Component({
      selector: 'app-slide-toggle',
        imports: [MatSlideToggleModule],
        templateUrl: './slide-toggle.component.html'
    })
    export class AppSlideToggleComponent {
        constructor() {}
    }
`;

export const FORM_SLIDE_TOGGLE_TS_SNIPPET = `  import {Component, inject} from '@angular/core';
    import {MatSlideToggleModule} from '@angular/material/slide-toggle';
    import {FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {MatButtonModule} from '@angular/material/button';
    import { MatSlideToggleModule, _MatSlideToggleRequiredValidatorModule,} from '@angular/material/slide-toggle';

    /**
     * @title Slide-toggle with forms
     */
    @Component({
      selector: 'app-slide-toggle',
        imports: [MatSlideToggleModule, FormsModule, _MatSlideToggleRequiredValidatorModule, MatButtonModule, ReactiveFormsModule,],
        templateUrl: './slide-toggle.component.html'
    })
    export class AppSlideToggleComponent {
        constructor() {}

        private _formBuilder = inject(FormBuilder);

        isChecked = true;
        formGroup = this._formBuilder.group({
            enableWifi: '',
            acceptTerms: ['', Validators.requiredTrue],
        });

        alertFormValues(formGroup: FormGroup) {
            alert(JSON.stringify(formGroup.value, null, 2));
        }
    }
`;

export const CONFIGURATION_SLIDE_TOGGLE_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatSlideToggleModule} from '@angular/material/slide-toggle';
    import {MatCheckboxModule} from '@angular/material/checkbox';
    import {FormsModule} from '@angular/forms';
    import {MatRadioModule} from '@angular/material/radio';
    import {MatCardModule} from '@angular/material/card';

    /**
     * @title Configurable slide-toggle
     */
    @Component({
      selector: 'app-slide-toggle',
        imports: [MatCardModule, MatRadioModule, FormsModule, MatCheckboxModule, MatSlideToggleModule],
        templateUrl: './slide-toggle.component.html'
    })
    export class AppSlideToggleComponent {
        constructor() {}

        checked = false;
        disabled = false;
    }
`;