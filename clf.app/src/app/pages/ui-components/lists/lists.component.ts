import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {DatePipe} from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';


// snippets
import { LIST_BASIC_HTML_SNIPPET, LIST_SECTIONS_HTML_SNIPPET, LIST_SELECTION_HTML_SNIPPET, LIST_SINGLE_SELECTION_HTML_SNIPPET, LIST_THREELINE_HTML_SNIPPET, LIST_THREELINE_TEXT_WRAPPING_HTML_SNIPPET, LIST_TWOLINE_HTML_SNIPPET } from './code/list-html-snippet';
import { LIST_BASIC_TS_SNIPPET, LIST_SELECTION_TS_SNIPPET } from './code/list-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';


export interface Section {
  name: string;
  updated: Date;
}

@Component({
    selector: 'app-lists',
    imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, Highlight,
        HighlightAuto,
        HighlightLineNumbers,
        AppCodeViewComponent,],
    templateUrl: './lists.component.html'
})
export class AppListsComponent {
  constructor() {}

  // 1 [Basic with list]
  codeForBasicList = LIST_BASIC_HTML_SNIPPET;
  codeForBasicListTs = LIST_BASIC_TS_SNIPPET;

  // 2 [Twoline with list]
  codeForTwolineList = LIST_TWOLINE_HTML_SNIPPET;
  codeForTwolineListTs = LIST_BASIC_TS_SNIPPET;

  // 3 [Threeline with list]
  codeForThreelineList = LIST_THREELINE_HTML_SNIPPET;
  codeForThreelineListTs = LIST_BASIC_TS_SNIPPET;

  // 4 [Threeline with TextWrapping list]
  codeForThreelineTextWrappingList = LIST_THREELINE_TEXT_WRAPPING_HTML_SNIPPET;
  codeForThreelineTextWrappingListTs = LIST_BASIC_TS_SNIPPET;

  // 5 [Selection with list]
  codeForSelectionList = LIST_SELECTION_HTML_SNIPPET;
  codeForSelectionListTs = LIST_SELECTION_TS_SNIPPET;

  // 6 [Single Selection with list]
  codeForSingleSelectionList = LIST_SINGLE_SELECTION_HTML_SNIPPET;
  codeForSingleSelectionListTs = LIST_SELECTION_TS_SNIPPET;

  // 6 [sections with list]
  codeForSectionsList = LIST_SECTIONS_HTML_SNIPPET;
  codeForSectionsListTs = LIST_SELECTION_TS_SNIPPET;


  typesOfShoes: string[] = ['Loafers', 'Sneakers'];

  folders: Section[] = [
    {
      name: 'Photos',
      updated: new Date('1/1/16'),
    },
    {
      name: 'Recipes',
      updated: new Date('1/17/16'),
    },
    {
      name: 'Work',
      updated: new Date('1/28/16'),
    },
  ];
  notes: Section[] = [
    {
      name: 'Vacation Itinerary',
      updated: new Date('2/20/16'),
    },
    {
      name: 'Kitchen Remodel',
      updated: new Date('1/18/16'),
    },
  ];
}
