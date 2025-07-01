import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { MENU_BASIC_HTML_SNIPPET, MENU_ICONS_HTML_SNIPPET, MENU_NESTED_HTML_SNIPPET, MENU_POSITIONS_HTML_SNIPPET } from './code/menu-html-snippet';
import { MENU_BASIC_TS_SNIPPET } from './code/menu-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-menu',
    imports: [MatCardModule, MatMenuModule, MatIconModule, TablerIconsModule, MatButtonModule,
      Highlight,
          HighlightAuto,
          HighlightLineNumbers,
          AppCodeViewComponent,
    ],
    templateUrl: './menu.component.html'
})
export class AppMenuComponent {
  constructor() {}

  // 1 [basic with menu]
  codeForMenuBasic = MENU_BASIC_HTML_SNIPPET;
  codeForMenuBasicTs = MENU_BASIC_TS_SNIPPET;

  // 2 [icons with menu]
  codeForMenuIcons = MENU_ICONS_HTML_SNIPPET;
  codeForMenuIconsTs = MENU_BASIC_TS_SNIPPET;

  // 3 [Nested with menu]
  codeForMenuNested = MENU_NESTED_HTML_SNIPPET;
  codeForMenuNestedTs = MENU_BASIC_TS_SNIPPET;

  // 4 [Positions with menu]
  codeForMenuPositions = MENU_POSITIONS_HTML_SNIPPET;
  codeForMenuPositionsTs = MENU_BASIC_TS_SNIPPET;
}
