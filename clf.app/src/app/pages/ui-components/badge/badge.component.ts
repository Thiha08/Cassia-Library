import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppCodeViewComponent } from '../../../components/code-view/code-view.component';

// snippets
import { TEXT_WITH_BADGE_TS_SNIPPET, BUTTON_LEFT_WITH_BADGE_TS_SNIPPET, BUTTON_TOGGLES_WITH_BADGE_TS_SNIPPET } from './code/badge-ts-snippet';
import { TEXT_WITH_BADGE_HTML_SNIPPET, SIZE_WITH_BADGE_HTML_SNIPPET, BUTTON_LEFT_WITH_BADGE_HTML_SNIPPET, ICON_WITH_BADGE_HTML_SNIPPET, BUTTON_TOGGLES_WITH_BADGE_HTML_SNIPPET } from './code/badge-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    TablerIconsModule,
    AppCodeViewComponent,
  ],
})
export class AppBadgeComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  hidden = false;

  toggleBadgeVisibility() {
    this.hidden = !this.hidden;
  }

  // 1 [text with badge]
  codeForTextBadge = TEXT_WITH_BADGE_HTML_SNIPPET;
  codeForTextBadgeTs = TEXT_WITH_BADGE_TS_SNIPPET;

  // 2 [size with badge]
  codeForSizeBadge = SIZE_WITH_BADGE_HTML_SNIPPET;
  codeForSizeBadgeTs = TEXT_WITH_BADGE_TS_SNIPPET;

   // 3 [button left position with badge]
   codeForButtonBadge = BUTTON_LEFT_WITH_BADGE_HTML_SNIPPET;
   codeForButtonBadgeTs = BUTTON_LEFT_WITH_BADGE_TS_SNIPPET;

   // 4 [icon with badge]
  codeForIconBadge = ICON_WITH_BADGE_HTML_SNIPPET;
  codeForIconBadgeTs = TEXT_WITH_BADGE_TS_SNIPPET;

  // 5 [button toggles with badge]
  codeForButtonTogglesBadge = BUTTON_TOGGLES_WITH_BADGE_HTML_SNIPPET;
  codeForButtonTogglesBadgeTs = BUTTON_TOGGLES_WITH_BADGE_TS_SNIPPET;
}
