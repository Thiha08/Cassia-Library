export const BASIC_CHIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatChipsModule } from '@angular/material/chips';

    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-chips',
          templateUrl: './chips.component.html',
          styleUrls: ['./chips.component.scss'],
          imports: [
            MatChipsModule,
          ],
          changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class AppChipsComponent {
        
    }
`;

export const DRAG_DROP_CHIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatChipsModule } from '@angular/material/chips';
    import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-chips',
          templateUrl: './chips.component.html',
          styleUrls: ['./chips.component.scss'],
          imports: [
            MatChipsModule,
            CdkDropList,
            CdkDragDrop,
            CdkDrag,
          ],
          changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class AppChipsComponent {
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
    }
    function isDragDrop(object: any): object is CdkDragDrop<string[]> {
      return 'previousIndex' in object;
    }
`;

export const STACKED_CHIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatChipsModule } from '@angular/material/chips';
    import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-chips',
          templateUrl: './chips.component.html',
          styleUrls: ['./chips.component.scss'],
          imports: [
            MatChipsModule,
            CdkDropList,
            CdkDragDrop,
            CdkDrag,
          ],
          changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class AppChipsComponent {
        //
        // Stacked
        //
        readonly bestBoys: string[] = ['Samoyed', 'Akita Inu', 'Alaskan Malamute', 'Siberian Husky'];
    }
`;

export const INPUT_CHIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-chips',
          templateUrl: './chips.component.html',
          styleUrls: ['./chips.component.scss'],
          imports: [
            MatChipsModule,
          ],
          changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class AppChipsComponent {
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
`;

export const FORM_CONTROL_CHIPS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
    import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-chips',
          templateUrl: './chips.component.html',
          styleUrls: ['./chips.component.scss'],
          imports: [
            MatChipsModule,
            FormsModule,
            ReactiveFormsModule,
          ],
          changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class AppChipsComponent {
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
            this.announcer.announce('removed keyword');
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
`;