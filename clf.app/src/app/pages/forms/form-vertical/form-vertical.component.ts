import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';

import { AppCodeViewComponent } from '../../../components/code-view/code-view.component';

// snippets
import {
  BASIC_LAYOUT_TS_SNIPPET,
  BASIC_WITH_ICONS_TS_SNIPPET,
  FORM_SEPARATOR_TS_SNIPPET,
  FORM_LABEL_ALIGN_TS_SNIPPET,
  COLLAPSE_FORM_TS_SNIPPET,
} from './code/form-vertical-ts-snippet';
import {
  BASIC_LAYOUT_HTML_SNIPPET,
  BASIC_WITH_ICONS_HTML_SNIPPET,
  FORM_SEPARATOR_HTML_SNIPPET,
  FORM_LABEL_ALIGN_HTML_SNIPPET,
  COLLAPSE_FORM_HTML_SNIPPET,
  FORM_WITH_TABS_HTML_SNIPPET,
} from './code/form-vertical-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  selector: 'app-form-vertical',
  imports: [
    MaterialModule,
    TablerIconsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    AppCodeViewComponent,
    HighlightLineNumbers,
    Highlight,
    HighlightAuto,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './form-vertical.component.html',
})
export class AppFormVerticalComponent {
  constructor() {}
  hide = true;
  hide2 = true;
  conhide = true;
  alignhide = true;

  // 3 accordian
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

  panelOpenState = false;

  // 1 [basic layout]
  codeForBasicLayout = BASIC_LAYOUT_HTML_SNIPPET;
  codeForBasicLayoutTs = BASIC_LAYOUT_TS_SNIPPET;

  // 2 [basic with icons]
  codeForBasicwithIcons = BASIC_WITH_ICONS_HTML_SNIPPET;
  codeForBasicwithIconsTs = BASIC_WITH_ICONS_TS_SNIPPET;

  // 3 [ Form Separator ]
  codeForFormSeparator = FORM_SEPARATOR_HTML_SNIPPET;
  codeForFormSeparatorTs = FORM_SEPARATOR_TS_SNIPPET;

  // 4 [ Form label align ]
  codeForFormLabelAlign = FORM_LABEL_ALIGN_HTML_SNIPPET;
  codeForFormLabelAlignTs = FORM_LABEL_ALIGN_TS_SNIPPET;

  // 5 [ collpase form ]
  codeForCollpaseForm = COLLAPSE_FORM_HTML_SNIPPET;
  codeForCollpaseFormTs = COLLAPSE_FORM_TS_SNIPPET;

  // 6 [ form with tabs]
  codeForFormwithTabs = FORM_WITH_TABS_HTML_SNIPPET;
  codeForFormwithTabsTs = COLLAPSE_FORM_TS_SNIPPET;
}
