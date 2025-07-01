import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { BUTTONS_TS_SNIPPET, TOGGLE_BUTTONS_TS_SNIPPET } from './code/button-ts-snippet';
import { BASIC_BUTTONS_HTML_SNIPPET, BASIC_TOGGLE_BUTTONS_HTML_SNIPPET, EXCLUSIVE_SELECTION_TOGGLE_BUTTONS_HTML_SNIPPET, EXTENDED_FAB_BUTTONS_HTML_SNIPPET, FAB_BUTTONS_HTML_SNIPPET, FLAT_BUTTONS_HTML_SNIPPET, ICON_BUTTONS_HTML_SNIPPET, MINI_FAB_BUTTONS_HTML_SNIPPET, MULTIPLE_SELECT_TOGGLE_BUTTONS_HTML_SNIPPET, OUTLINED_BUTTONS_HTML_SNIPPET, RAISED_BUTTONS_HTML_SNIPPET, REACTIVE_FORM_TOGGLE_BUTTONS_HTML_SNIPPET } from './code/button-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';


@Component({
    selector: 'app-button',
    imports: [FormsModule, ReactiveFormsModule, MaterialModule, TablerIconsModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './button.component.html'
})
export class AppButtonComponent {
  constructor() {}

  // 1 [Basic with Buttons]
  codeForBasicButtons = BASIC_BUTTONS_HTML_SNIPPET;
  codeForBasicButtonsTs = BUTTONS_TS_SNIPPET;

  // 2 [Raised with Buttons]
  codeForRaisedButtons = RAISED_BUTTONS_HTML_SNIPPET;
  codeForRaisedButtonsTs = BUTTONS_TS_SNIPPET;

  // 3 [Outlined with Buttons]
  codeForOutlinedButtons = OUTLINED_BUTTONS_HTML_SNIPPET;
  codeForOutlinedButtonsTs = BUTTONS_TS_SNIPPET;

  // 4 [Flat with Buttons]
  codeForFlatButtons = FLAT_BUTTONS_HTML_SNIPPET;
  codeForFlatButtonsTs = BUTTONS_TS_SNIPPET;

  // 5 [Icon with Buttons]
  codeForIconButtons = ICON_BUTTONS_HTML_SNIPPET;
  codeForIconButtonsTs = BUTTONS_TS_SNIPPET;

  // 6 [Fab with Buttons]
  codeForFabButtons = FAB_BUTTONS_HTML_SNIPPET;
  codeForFabButtonsTs = BUTTONS_TS_SNIPPET;

  // 7 [Mini Fab with Buttons]
  codeForMiniFabButtons = MINI_FAB_BUTTONS_HTML_SNIPPET;
  codeForMiniFabButtonsTs = BUTTONS_TS_SNIPPET;

  // 8 [Extended Fab with Buttons]
  codeForExtendedFabButtons = EXTENDED_FAB_BUTTONS_HTML_SNIPPET;
  codeForExtendedFabButtonsTs = BUTTONS_TS_SNIPPET;

  // 9 [Basic with Buttons]
  codeForBasicToggleButtons = BASIC_TOGGLE_BUTTONS_HTML_SNIPPET;
  codeForBasicToggleButtonsTs = TOGGLE_BUTTONS_TS_SNIPPET;

  // 10 [Multiple Select with Buttons]
  codeForMultipleSelectToggleButtons = MULTIPLE_SELECT_TOGGLE_BUTTONS_HTML_SNIPPET;
  codeForMultipleSelectToggleButtonsTs = TOGGLE_BUTTONS_TS_SNIPPET;

  // 11 [Reactive Form with Buttons]
  codeForReactiveFormToggleButtons = REACTIVE_FORM_TOGGLE_BUTTONS_HTML_SNIPPET;
  codeForReactiveFormToggleButtonsTs = TOGGLE_BUTTONS_TS_SNIPPET;

  // 12 [Exclusive selection with Buttons]
  codeForExclusiveSelectionToggleButtons = EXCLUSIVE_SELECTION_TOGGLE_BUTTONS_HTML_SNIPPET;
  codeForExclusiveSelectionToggleButtonsTs = TOGGLE_BUTTONS_TS_SNIPPET;

  //   reactive form
  fontStyleControl = new FormControl('');
  fontStyle?: string;
}
