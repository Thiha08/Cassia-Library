export const BASIC_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component} from '@angular/core';
    import {MatDatepickerModule} from '@angular/material/datepicker';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';
    import {provideNativeDateAdapter} from '@angular/material/core';

    /**
     * @title Basic datepicker */
     */
    @Component({
        selector: 'app-datepicker',
        imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
    })
    export class AppDatepickerComponent {
        constructor() {}
    }
`;

export const CUSTOM_SELECTIONS_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component, Injectable, inject} from '@angular/core';
    import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
    import {
    DateRange,
    MAT_DATE_RANGE_SELECTION_STRATEGY,
    MatDateRangeSelectionStrategy,
    MatDatepickerModule,
    } from '@angular/material/datepicker';
    import {MatFormFieldModule} from '@angular/material/form-field';

    @Injectable()
    export class FiveDayRangeSelectionStrategy<D>
      implements MatDateRangeSelectionStrategy<D> {
      constructor(private _dateAdapter: DateAdapter<D>) { }
    
      selectionFinished(date: D | null): DateRange<D> {
        return this._createFiveDayRange(date);
      }
    
      createPreview(activeDate: D | null): DateRange<D> {
        return this._createFiveDayRange(activeDate);
      }
    
      private _createFiveDayRange(date: D | null): DateRange<D> {
        if (date) {
          const start = this._dateAdapter.addCalendarDays(date, -2);
          const end = this._dateAdapter.addCalendarDays(date, 2);
          return new DateRange<D>(start, end);
        }
    
        return new DateRange<D>(null, null);
      }
    }

    /**
     * @title Date range picker with a custom selection strategy */
     */
    @Component({
        selector: 'app-datepicker',
        imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
        providers: [
            {
            provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
            useClass: FiveDayRangeSelectionStrategy,
            },
            provideNativeDateAdapter(),
        ],
        imports: [MatFormFieldModule, MatDatepickerModule],
            changeDetection: ChangeDetectionStrategy.OnPush,
        })
    export class AppDatepickerComponent {
        constructor() {}
    }
`;

export const FORM_INTEGRATION_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component} from '@angular/core';
    import {JsonPipe} from '@angular/common';
    import {ChangeDetectionStrategy, Component} from '@angular/core';
    import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {provideNativeDateAdapter} from '@angular/material/core';
    import {MatDatepickerModule} from '@angular/material/datepicker';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Date range picker forms integration */
     */
    @Component({
        selector: 'app-datepicker',
        imports: [MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, JsonPipe],
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
    })
    export class AppDatepickerComponent {
        constructor() {}

        range = new FormGroup({
            start: new FormControl<Date | null>(null),
            end: new FormControl<Date | null>(null),
        });
    }
`;

export const ACTION_BUTTONS_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component} from '@angular/core';
    import {MatButtonModule} from '@angular/material/button';
    import {MatDatepickerModule} from '@angular/material/datepicker';
    import {MatInputModule} from '@angular/material/input';
    import {MatIconModule} from '@angular/material/icon';
    import {MatFormFieldModule} from '@angular/material/form-field';
    import {provideNativeDateAdapter} from '@angular/material/core';

    /**
     * @title Datepicker action buttons */
     */
    @Component({
        selector: 'app-datepicker',
        imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule, MatIconModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        providers: [provideNativeDateAdapter()],
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
    })
    export class AppDatepickerComponent {
        constructor() {}
    }
`;

export const DATE_RANGE_PICKER_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component} from '@angular/core';
    import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {provideNativeDateAdapter} from '@angular/material/core';
    import {MatDatepickerModule} from '@angular/material/datepicker';
    import {MatFormFieldModule} from '@angular/material/form-field';

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    /**
     * @title Datepicker action buttons */
     */
    @Component({
        selector: 'app-datepicker',
        providers: [provideNativeDateAdapter()],
        imports: [MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
    })
    export class AppDatepickerComponent {
        constructor() {}

        campaignOne = new FormGroup({
            start: new FormControl(new Date(year, month, 13)),
            end: new FormControl(new Date(year, month, 16)),
          });
          campaignTwo = new FormGroup({
            start: new FormControl(new Date(year, month, 15)),
            end: new FormControl(new Date(year, month, 19)),
        });
    }
`;

export const CUSTOM_DATE_CLASSES_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
    import {provideNativeDateAdapter} from '@angular/material/core';
    import {MatCalendarCellClassFunction, MatDatepickerModule} from '@angular/material/datepicker';
    import {MatFormFieldModule} from '@angular/material/form-field';
    import {MatInputModule} from '@angular/material/input';

    /**
     * @title Datepicker with custom date classes */
     */
    @Component({
        selector: 'app-datepicker',
        encapsulation: ViewEncapsulation.None,
        providers: [provideNativeDateAdapter()],
        imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
    })
    export class AppDatepickerComponent {
        constructor() {}

        dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
            // Only highligh dates inside the month view.
            if (view === 'month') {
              const date = cellDate.getDate();
        
              // Highlight the 1st and 20th day of each month.
              return date === 1 || date === 20 ? 'example-custom-date-class' : '';
            }
        
            return '';
        };
    }
`;

export const CHANGE_EVENTS_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
    import {provideNativeDateAdapter} from '@angular/material/core';
    import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
    import {MatFormFieldModule} from '@angular/material/form-field';
    import {MatInputModule} from '@angular/material/input';

    /**
     * @title Datepicker input and change events */
     */
    @Component({
        selector: 'app-datepicker',
        providers: [provideNativeDateAdapter()],
        imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
    })
    export class AppDatepickerComponent {
        constructor() {}

        events: string[] = [];
        
          addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
            this.events.push('{type}: {event.value}');
        }
    }
`;

export const INLINE_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component, model} from '@angular/core';
    import {MatCardModule} from '@angular/material/card';
    import {provideNativeDateAdapter} from '@angular/material/core';
    import {MatDatepickerModule} from '@angular/material/datepicker';

    /**
     * @title Datepicker inline calendar example */
     */
    @Component({
        selector: 'app-datepicker',
        providers: [provideNativeDateAdapter()],
        imports: [MatCardModule, MatDatepickerModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
    })
    export class AppDatepickerComponent {
        constructor() {}

        selected: Date | null;
    }
`;

export const START_DATE_DATEPICKER_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component} from '@angular/core';
    import {provideNativeDateAdapter} from '@angular/material/core';
    import {MatDatepickerModule} from '@angular/material/datepicker';
    import {MatFormFieldModule} from '@angular/material/form-field';
    import {MatInputModule} from '@angular/material/input';

    /**
     * @title Datepicker start date */
     */
    @Component({
        selector: 'app-datepicker',
        providers: [provideNativeDateAdapter()],
        imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './datepicker.component.html',
        styleUrls: ['datepicker.component.scss'],
    })
    export class AppDatepickerComponent {
        constructor() {}

        startDate = new Date(1990, 0, 1);
    }
`;