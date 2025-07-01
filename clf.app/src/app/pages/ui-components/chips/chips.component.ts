import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ThemePalette } from '@angular/material/core';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';


// snippets
import { BASIC_CHIPS_TS_SNIPPET, DRAG_DROP_CHIPS_TS_SNIPPET, FORM_CONTROL_CHIPS_TS_SNIPPET, INPUT_CHIPS_TS_SNIPPET, STACKED_CHIPS_TS_SNIPPET } from './code/chips-ts-snippet';
import { BASIC_CHIPS_HTML_SNIPPET, AVATAR_CHIPS_HTML_SNIPPET, DRAG_DROP_CHIPS_HTML_SNIPPET, STACKED_CHIPS_HTML_SNIPPET, INPUT_CHIPS_HTML_SNIPPET, FORM_CONTROL_CHIPS_HTML_SNIPPET } from './code/chips-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

export interface ChipColor {
  name: string;
  color: ThemePalette;
}

export interface Fruit {
  name: string;
}

export interface Vegetable {
  name: string;
}

@Component({
  selector: 'app-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss'],
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    CdkDropList,
    CdkDrag,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    AppCodeViewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppChipsComponent {

  // 1 [basic with chip]
  codeForBasicChips = BASIC_CHIPS_HTML_SNIPPET;
  codeForBasicChipsTs = BASIC_CHIPS_TS_SNIPPET;

  // 2 [avatar with chip]
  codeForAvatarChips = AVATAR_CHIPS_HTML_SNIPPET;
  codeForAvatarChipsTs = BASIC_CHIPS_TS_SNIPPET;

  // 3 [avatar with chip]
  codeForDragDropChips = DRAG_DROP_CHIPS_HTML_SNIPPET;
  codeForDragDropChipsTs = DRAG_DROP_CHIPS_TS_SNIPPET;

  // 4 [Stacked with chip]
  codeForStackedChips = STACKED_CHIPS_HTML_SNIPPET;
  codeForStackedChipsTs = STACKED_CHIPS_TS_SNIPPET;

  // 5 [Input with chip]
  codeForInputChips = INPUT_CHIPS_HTML_SNIPPET;
  codeForInputChipsTs = INPUT_CHIPS_TS_SNIPPET;

  // 6 [Form Control with chip]
  codeForFormControlChips = FORM_CONTROL_CHIPS_HTML_SNIPPET;
  codeForFormControlChipsTs = FORM_CONTROL_CHIPS_TS_SNIPPET;

  // drag n drop
  readonly vegetables = signal<Vegetable[]>([
    { name: 'apple' },
    { name: 'banana' },
    { name: 'strawberry' },
    { name: 'orange' },
    { name: 'kiwi' },
    { name: 'cherry' },
  ]);

  drop(event: CdkDragDrop<Vegetable[]>) {
    this.vegetables.update((vegetables) => {
      moveItemInArray(vegetables, event.previousIndex, event.currentIndex);
      return [...vegetables];
    });
  }

  //
  // Stacked
  //
  readonly bestBoys: string[] = ['Samoyed', 'Akita Inu', 'Alaskan Malamute', 'Siberian Husky'];

  //
  //  chips with input
  //
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  fruits: Fruit[] = [{ name: 'Lemon' }, { name: 'Lime' }, { name: 'Apple' }];

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push({ name: value });
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(fruit: Fruit): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  edit(fruit: Fruit, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(fruit);
      return;
    }

    // Edit existing fruit
    const index = this.fruits.indexOf(fruit);
    if (index >= 0) {
      this.fruits[index].name = value;
    }
  }

  // form control

  readonly keywords = signal(['angular', 'how-to', 'tutorial', 'accessibility']);
  readonly formControl = new FormControl(['angular']);

  announcer = inject(LiveAnnouncer);

  removeKeyword(keyword: string) {
    this.keywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword}`);
      return [...keywords];
    });
  }

  addForm(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our keyword
    if (value) {
      this.keywords.update(keywords => [...keywords, value]);
    }

    // Clear the input value
    event.chipInput!.clear();
  }
}
function isDragDrop(object: any): object is CdkDragDrop<string[]> {
  return 'previousIndex' in object;
}
