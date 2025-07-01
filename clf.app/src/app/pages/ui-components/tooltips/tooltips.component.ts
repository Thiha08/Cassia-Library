import { Component } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { BASIC_TOOLTIPS_TS_SNIPPET, CHANGE_MESSAGE_TOOLTIPS_TS_SNIPPET, DISABLED_CLICK_TOOLTIPS_TS_SNIPPET, SHOW_AND_HIDE_TOOLTIPS_TS_SNIPPET } from './code/tooltips-ts-snippet';
import { BASIC_TOOLTIPS_HTML_SNIPPET, CHANGE_MESSAGE_TOOLTIPS_HTML_SNIPPET, DISABLED_CLICK_TOOLTIPS_HTML_SNIPPET, POSITION_TOOLTIPS_HTML_SNIPPET, SHOW_AND_HIDE_TOOLTIPS_HTML_SNIPPET, UPPERCASE_TOOLTIPS_HTML_SNIPPET } from './code/tooltips-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';


@Component({
    selector: 'app-tooltips',
    imports: [
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatTooltipModule, MatCardModule, MatInputModule, MatCheckboxModule,
        Highlight,
        HighlightAuto,
        HighlightLineNumbers,
        AppCodeViewComponent,
    ],
    templateUrl: './tooltips.component.html'
})
export class AppTooltipsComponent {

  // 1 [tooltips with toolbar]
  codeForTooltipsBasic = BASIC_TOOLTIPS_HTML_SNIPPET;
  codeForTooltipsBasicTs = BASIC_TOOLTIPS_TS_SNIPPET;

  // 2 [Uppercase with toolbar]
  codeForTooltipsUppercase = UPPERCASE_TOOLTIPS_HTML_SNIPPET;
  codeForTooltipsUppercaseTs = BASIC_TOOLTIPS_TS_SNIPPET;

  // 3 [Disabled on click with toolbar]
  codeForTooltipsDisabledClick = DISABLED_CLICK_TOOLTIPS_HTML_SNIPPET;
  codeForTooltipsDisabledClickTs = DISABLED_CLICK_TOOLTIPS_TS_SNIPPET;

  // 4 [Position with toolbar]
  codeForTooltipsPosition = POSITION_TOOLTIPS_HTML_SNIPPET;
  codeForTooltipsPositionTs = BASIC_TOOLTIPS_TS_SNIPPET;

  // 5 [Show and Hide with toolbar]
  codeForTooltipsShowAndHide = SHOW_AND_HIDE_TOOLTIPS_HTML_SNIPPET;
  codeForTooltipsShowAndHideTs = SHOW_AND_HIDE_TOOLTIPS_TS_SNIPPET;

  // 6 [Change Message with toolbar]
  codeForTooltipsChangeMessage = CHANGE_MESSAGE_TOOLTIPS_HTML_SNIPPET;
  codeForTooltipsChangeMessageTs = CHANGE_MESSAGE_TOOLTIPS_TS_SNIPPET;

  //  disabled
  disabled = new FormControl(false);

  // show and hide
  showDelay = new FormControl(1000);
  hideDelay2 = new FormControl(2000);

  // change message
  message = new FormControl('Info about the action');
}
