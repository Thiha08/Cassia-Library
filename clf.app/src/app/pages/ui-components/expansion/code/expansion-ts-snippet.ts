export const BASIC_EXPANSION_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatExpansionModule } from '@angular/material/expansion';

    /**
     * @title Expansion overview
     */
    @Component({
        selector: 'app-expansion',
            providers: [provideNativeDateAdapter()],
            imports: [
                MatExpansionModule,
            ],
            changeDetection: ChangeDetectionStrategy.OnPush,
            templateUrl: './expansion.component.html'
    })
    export class AppExpansionComponent {
        // basic
        panelOpenState = false;
    }
`;

export const EXPAND_EXPANSION_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatExpansionModule } from '@angular/material/expansion';

    /**
     * @title Expansion overview
     */
    @Component({
        selector: 'app-expansion',
            providers: [provideNativeDateAdapter()],
            imports: [
                MatExpansionModule,
            ],
            changeDetection: ChangeDetectionStrategy.OnPush,
            templateUrl: './expansion.component.html'
    })
    export class AppExpansionComponent {
        // expand all
        @ViewChild(MatAccordion) accordion: MatAccordion;
        constructor() {}
    }
`;

export const ACCORDIAN_EXPANSION_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatExpansionModule } from '@angular/material/expansion';

    /**
     * @title Expansion overview
     */
    @Component({
        selector: 'app-expansion',
            providers: [provideNativeDateAdapter()],
            imports: [
                MatExpansionModule,
            ],
            changeDetection: ChangeDetectionStrategy.OnPush,
            templateUrl: './expansion.component.html'
    })
    export class AppExpansionComponent {
        // accordian
        step = 0;

        setStep(index: number) {
            this.step = index;
        }

        nextStep() {
            this.step++;
        }

        prevStep() {
            this.step--;
        }
    }
`;