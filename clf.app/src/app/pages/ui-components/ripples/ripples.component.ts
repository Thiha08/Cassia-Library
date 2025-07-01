import { Component, OnInit } from '@angular/core';
import {MatRippleModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { RIPPLES_HTML_SNIPPET } from './code/ripples-html-snippet';
import { RIPPLES_TS_SNIPPET } from './code/ripples-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-ripples',
    imports: [MatCheckboxModule, FormsModule, MatFormFieldModule, MatInputModule, MatRippleModule, MatCardModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './ripples.component.html',
    styleUrls: ['./ripples.component.scss']
})
export class AppRipplesComponent implements OnInit {

  // 1 [Ripple]
  codeForRipple = RIPPLES_HTML_SNIPPET;
  codeForRippleTs = RIPPLES_TS_SNIPPET;

  centered = false;
  disabled = false;
  unbounded = false;

  radius: number;
  color: string;

  constructor() {}

  ngOnInit(): void {}
}
