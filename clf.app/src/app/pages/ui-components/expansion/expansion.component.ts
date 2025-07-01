import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { ACCORDIAN_EXPANSION_TS_SNIPPET, BASIC_EXPANSION_TS_SNIPPET, EXPAND_EXPANSION_TS_SNIPPET } from './code/expansion-ts-snippet';
import { ACCORDIAN_EXPANSION_HTML_SNIPPET, BASIC_EXPANSION_HTML_SNIPPET, EXPAND_EXPANSION_HTML_SNIPPET } from './code/expansion-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';


@Component({
    selector: 'app-expansion',
    providers: [provideNativeDateAdapter()],
    imports: [
        MatButtonModule,
        MatExpansionModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        TablerIconsModule,
        MatCardModule,
        MatTabsModule,
        Highlight,
        HighlightAuto,
        HighlightLineNumbers,
        AppCodeViewComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './expansion.component.html'
})
export class AppExpansionComponent {
  // 2 expand all
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor() {}

  // 1 basic
  panelOpenState = false;

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

  // 1 [basic with expansion]
  codeForBasicExpansion = BASIC_EXPANSION_HTML_SNIPPET;
  codeForBasicExpansionTs = BASIC_EXPANSION_TS_SNIPPET;

  // 2 [Expand with expansion]
  codeForExpandExpansion = EXPAND_EXPANSION_HTML_SNIPPET;
  codeForExpandExpansionTs = EXPAND_EXPANSION_TS_SNIPPET;

  // 3 [Expand with expansion]
  codeForAccordianExpansion = ACCORDIAN_EXPANSION_HTML_SNIPPET;
  codeForAccordianExpansionTs = ACCORDIAN_EXPANSION_TS_SNIPPET;

}
