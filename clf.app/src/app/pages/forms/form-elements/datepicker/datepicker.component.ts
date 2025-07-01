import { Component, Injectable, ViewEncapsulation } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MaterialModule } from '../../../../material.module';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { ACTION_BUTTONS_DATEPICKER_TS_SNIPPET, BASIC_DATEPICKER_TS_SNIPPET, CHANGE_EVENTS_DATEPICKER_TS_SNIPPET, CUSTOM_DATE_CLASSES_DATEPICKER_TS_SNIPPET, CUSTOM_SELECTIONS_DATEPICKER_TS_SNIPPET, DATE_RANGE_PICKER_DATEPICKER_TS_SNIPPET, FORM_INTEGRATION_DATEPICKER_TS_SNIPPET, INLINE_DATEPICKER_TS_SNIPPET, START_DATE_DATEPICKER_TS_SNIPPET } from './code/datepicker-ts-snippet';
import { ACTION_BUTTONS_DATEPICKER_HTML_SNIPPET, BASIC_DATEPICKER_HTML_SNIPPET, CHANGE_EVENTS_DATEPICKER_HTML_SNIPPET, CUSTOM_DATE_CLASSES_DATEPICKER_HTML_SNIPPET, CUSTOM_ICON_DATEPICKER_HTML_SNIPPET, CUSTOM_SELECTIONS_DATEPICKER_HTML_SNIPPET, DATE_RANGE_PICKER_DATEPICKER_HTML_SNIPPET, DISABLED_DATEPICKER_HTML_SNIPPET, FORM_INTEGRATION_DATEPICKER_HTML_SNIPPET, INLINE_DATEPICKER_HTML_SNIPPET, OPEN_METHOD_DATEPICKER_HTML_SNIPPET, PALLETE_COLORS_DATEPICKER_HTML_SNIPPET, START_DATE_DATEPICKER_HTML_SNIPPET, TOUCH_UI_DATEPICKER_HTML_SNIPPET } from './code/datepicker-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';


const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();

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

@Component({
  selector: 'app-datepicker',
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    AppCodeViewComponent,
  ],
  templateUrl: './datepicker.component.html',
  styleUrls: ['datepicker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ]
})
export class AppDatepickerComponent {

  // 1 [Basic with Datepicker]
  codeForBasicDatepicker = BASIC_DATEPICKER_HTML_SNIPPET;
  codeForBasicDatepickerTs = BASIC_DATEPICKER_TS_SNIPPET;

  // 2 [Custom Selection with Datepicker]
  codeForCustomSelectionDatepicker = CUSTOM_SELECTIONS_DATEPICKER_HTML_SNIPPET;
  codeForCustomSelectionDatepickerTs = CUSTOM_SELECTIONS_DATEPICKER_TS_SNIPPET;

  // 3 [Forms integration with Datepicker]
  codeForFormsIntegrationDatepicker = FORM_INTEGRATION_DATEPICKER_HTML_SNIPPET;
  codeForFormsIntegrationDatepickerTs = FORM_INTEGRATION_DATEPICKER_TS_SNIPPET;

  // 4 [Action buttons with Datepicker]
  codeForActionButtonsDatepicker = ACTION_BUTTONS_DATEPICKER_HTML_SNIPPET;
  codeForActionButtonsDatepickerTs = ACTION_BUTTONS_DATEPICKER_TS_SNIPPET;

  // 5 [Date range picker with Datepicker]
  codeForDateRangePickerDatepicker = DATE_RANGE_PICKER_DATEPICKER_HTML_SNIPPET;
  codeForDateRangePickerDatepickerTs = DATE_RANGE_PICKER_DATEPICKER_TS_SNIPPET;

  // 6 [Open Method with Datepicker]
  codeForOpenMethodDatepicker = OPEN_METHOD_DATEPICKER_HTML_SNIPPET;
  codeForOpenMethodDatepickerTs = ACTION_BUTTONS_DATEPICKER_TS_SNIPPET;

  // 7 [Custom Icon with Datepicker]
  codeForCustomIconDatepicker = CUSTOM_ICON_DATEPICKER_HTML_SNIPPET;
  codeForCustomIconDatepickerTs = ACTION_BUTTONS_DATEPICKER_TS_SNIPPET;

  // 8 [Custom Date Classes with Datepicker]
  codeForCustomDateClassesDatepicker = CUSTOM_DATE_CLASSES_DATEPICKER_HTML_SNIPPET;
  codeForCustomDateClassesDatepickerTs = CUSTOM_DATE_CLASSES_DATEPICKER_TS_SNIPPET;

  // 9 [Pallete Colors with Datepicker]
  codeForPalleteColorsDatepicker = PALLETE_COLORS_DATEPICKER_HTML_SNIPPET;
  codeForPalleteColorsDatepickerTs = ACTION_BUTTONS_DATEPICKER_TS_SNIPPET;

  // 10 [Change Events with Datepicker]
  codeForChangeEventsDatepicker = CHANGE_EVENTS_DATEPICKER_HTML_SNIPPET;
  codeForChangeEventsDatepickerTs = CHANGE_EVENTS_DATEPICKER_TS_SNIPPET;

  // 11 [Disabled with Datepicker]
  codeForDisabledDatepicker = DISABLED_DATEPICKER_HTML_SNIPPET;
  codeForDisabledDatepickerTs = BASIC_DATEPICKER_TS_SNIPPET;

  // 12 [Inline with Datepicker]
  codeForInlineDatepicker = INLINE_DATEPICKER_HTML_SNIPPET;
  codeForInlineDatepickerTs = INLINE_DATEPICKER_TS_SNIPPET;

  // 13 [Start Date with Datepicker]
  codeForStartDateDatepicker = START_DATE_DATEPICKER_HTML_SNIPPET;
  codeForStartDateDatepickerTs = START_DATE_DATEPICKER_TS_SNIPPET;

  // 14 [touch UI with Datepicker]
  codeForTouchUIDatepicker = TOUCH_UI_DATEPICKER_HTML_SNIPPET;
  codeForTouchUIDatepickerTs = ACTION_BUTTONS_DATEPICKER_TS_SNIPPET;


  // inline
  selected: Date | null;

  //   start date
  startDate = new Date(1990, 0, 1);

  // date range picker
  campaignOne = new FormGroup({
    start: new FormControl(new Date(year, month, 13)),
    end: new FormControl(new Date(year, month, 16)),
  });
  campaignTwo = new FormGroup({
    start: new FormControl(new Date(year, month, 15)),
    end: new FormControl(new Date(year, month, 19)),
  });

  //   form integration

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  //   custom date classes
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const date = cellDate.getDate();

      // Highlight the 1st and 20th day of each month.
      return date === 1 || date === 20 ? 'example-custom-date-class' : '';
    }

    return '';
  };

  //   change events
  events: string[] = [];

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events.push(`${type}: ${event.value}`);
  }

  constructor() { }
}
