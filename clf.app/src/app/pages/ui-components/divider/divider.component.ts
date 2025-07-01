import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { DIVIDER_BASIC_HTML_SNIPPET, DIVIDER_INSET_HTML_SNIPPET, DIVIDER_VERTICAL_HTML_SNIPPET } from './code/divider-html-snippet';
import { DIVIDER_BASIC_TS_SNIPPET } from './code/divider-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-divider',
    imports: [MatDividerModule, MatListModule, MatCardModule,Highlight,
        HighlightAuto,
        HighlightLineNumbers,
        AppCodeViewComponent,],
    templateUrl: './divider.component.html'
})
export class AppDividerComponent {
    // 1 [basic with divider]
    codeForDividerBasic = DIVIDER_BASIC_HTML_SNIPPET;
    codeForDividerBasicTs = DIVIDER_BASIC_TS_SNIPPET;

    // 2 [inset with divider]
    codeForDividerInset = DIVIDER_INSET_HTML_SNIPPET;
    codeForDividerInsetTs = DIVIDER_BASIC_TS_SNIPPET;

    // 3 [Vertical with divider]
    codeForDividerVertical = DIVIDER_VERTICAL_HTML_SNIPPET;
    codeForDividerVerticalTs = DIVIDER_BASIC_TS_SNIPPET;
}
