import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ThemePalette } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import {DatePipe} from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { BACKGROUND_TABS_HTML_SNIPPET, BASIC_TABS_HTML_SNIPPET, CENTER_ALIGN_TABS_HTML_SNIPPET, CONTENT_LOADED_LAZILY_TABS_HTML_SNIPPET, CUSTOM_LABEL_TABS_HTML_SNIPPET, FIT_TO_BAR_CONTENT_TABS_HTML_SNIPPET, GROUP_TABS_HTML_SNIPPET, ICON_TABS_HTML_SNIPPET, NAVBAR_BACKGROUND_TABS_HTML_SNIPPET, NO_ANIMATION_TABS_HTML_SNIPPET, PAGINATED_TABS_HTML_SNIPPET, POSITION_TABS_HTML_SNIPPET, POSITION_WITH_ICON_TABS_HTML_SNIPPET, RIGHT_ALIGN_TABS_HTML_SNIPPET, SLOW_ANIMATION_TABS_HTML_SNIPPET } from './code/tabs-html-snippet';
import { BACKGROUND_TABS_TS_SNIPPET, BASIC_TABS_TS_SNIPPET, CONTENT_LOADED_LAZILY_TABS_TS_SNIPPET, NAVBAR_BACKGROUND_TABS_TS_SNIPPET, PAGINATED_TABS_TS_SNIPPET } from './code/tabs-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-tabs',
    imports: [MatTabsModule, MatCardModule, MatIconModule, TablerIconsModule, DatePipe, MatButtonModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './tabs.component.html'
})
export class AppTabsComponent {

  // 1 [Basic with tabs]
  codeForTabsBasic = BASIC_TABS_HTML_SNIPPET;
  codeForTabsBasicTs = BASIC_TABS_TS_SNIPPET;

  // 2 [Center Align with tabs]
  codeForTabsCenterAlign = CENTER_ALIGN_TABS_HTML_SNIPPET;
  codeForTabsCenterAlignTs = BASIC_TABS_TS_SNIPPET;

  // 3 [right Align with tabs]
  codeForTabsRightAlign = RIGHT_ALIGN_TABS_HTML_SNIPPET;
  codeForTabsRightAlignTs = BASIC_TABS_TS_SNIPPET;

  // 4 [No Animation with tabs]
  codeForTabsNoAnimation = NO_ANIMATION_TABS_HTML_SNIPPET;
  codeForTabsNoAnimationTs = BASIC_TABS_TS_SNIPPET;

  // 5 [Slow Animation with tabs]
  codeForTabsSlowAnimation = SLOW_ANIMATION_TABS_HTML_SNIPPET;
  codeForTabsSlowAnimationTs = BASIC_TABS_TS_SNIPPET;

  // 6 [Group with tabs]
  codeForTabsGroup = GROUP_TABS_HTML_SNIPPET;
  codeForTabsGroupTs = BASIC_TABS_TS_SNIPPET;

  // 7 [Cusom Label with tabs]
  codeForTabsCusomLabel = CUSTOM_LABEL_TABS_HTML_SNIPPET;
  codeForTabsCusomLabelTs = BASIC_TABS_TS_SNIPPET;

  // 8 [icon with tabs]
  codeForTabsIcon = ICON_TABS_HTML_SNIPPET;
  codeForTabsIconTs = BASIC_TABS_TS_SNIPPET;

  // 9 [position with tabs]
  codeForTabsPosition = POSITION_TABS_HTML_SNIPPET;
  codeForTabsPositionTs = BASIC_TABS_TS_SNIPPET;

  // 10 [position with tabs]
  codeForTabsPositionWithIcon = POSITION_WITH_ICON_TABS_HTML_SNIPPET;
  codeForTabsPositionWithIconTs = BASIC_TABS_TS_SNIPPET;

  // 11 [Background with tabs]
  codeForTabsBackground = BACKGROUND_TABS_HTML_SNIPPET;
  codeForTabsBackgroundTs = BACKGROUND_TABS_TS_SNIPPET;

  // 12 [Fit to Bar Content with tabs]
  codeForTabsFitToBarContent = FIT_TO_BAR_CONTENT_TABS_HTML_SNIPPET;
  codeForTabsFitToBarContentTs = BASIC_TABS_TS_SNIPPET;

  // 13 [Content loaded lazily with tabs]
  codeForTabsContentLoadedLazily = CONTENT_LOADED_LAZILY_TABS_HTML_SNIPPET;
  codeForTabsContentLoadedLazilyTs = CONTENT_LOADED_LAZILY_TABS_TS_SNIPPET;

  // 14 [Paginated with tabs]
  codeForTabsPaginated = PAGINATED_TABS_HTML_SNIPPET;
  codeForTabsPaginatedTs = PAGINATED_TABS_TS_SNIPPET;

  // 15 [Navbar Background with tabs]
  codeForTabsNavbarBackground = NAVBAR_BACKGROUND_TABS_HTML_SNIPPET;
  codeForTabsNavbarBackgroundTs = NAVBAR_BACKGROUND_TABS_TS_SNIPPET;

  constructor() {}

  // loaded lazily
  tabLoadTimes: Date[] = [];

  getTimeLoaded(index: number) {
    if (!this.tabLoadTimes[index]) {
      this.tabLoadTimes[index] = new Date();
    }

    return this.tabLoadTimes[index];
  }

  // background
  links = ['Item One', 'Item Second', 'Item Third'];
  activeLink = this.links[0];
  background: ThemePalette = undefined;

  toggleBackground() {
    this.background = this.background ? undefined : 'primary';
  }

  addLink() {
    this.links.push(`Link ${this.links.length + 1}`);
  }
}
