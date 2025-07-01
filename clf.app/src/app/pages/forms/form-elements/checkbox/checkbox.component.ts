import { Component, computed, signal } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../material.module';
import { CommonModule } from '@angular/common';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { BASIC_CHECKBOX_TS_SNIPPET, CONFIGURABLE_CHECKBOX_TS_SNIPPET, REACTIVE_FORM_CHECKBOX_TS_SNIPPET } from './code/checkbox-ts-snippet';
import { BASIC_CHECKBOX_HTML_SNIPPET, CONFIGURABLE_CHECKBOX_HTML_SNIPPET, REACTIVE_FORM_CHECKBOX_HTML_SNIPPET } from './code/checkbox-html-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

export interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}

@Component({
    selector: 'app-checkbox',
    imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './checkbox.component.html'
})
export class AppCheckboxComponent {

  // 1 [Basic with Checkbox]
  codeForBasicCheckbox = BASIC_CHECKBOX_HTML_SNIPPET;
  codeForBasicCheckboxTs = BASIC_CHECKBOX_TS_SNIPPET;

  // 2 [Configurable with Checkbox]
  codeForConfigurableCheckbox = CONFIGURABLE_CHECKBOX_HTML_SNIPPET;
  codeForConfigurableCheckboxTs = CONFIGURABLE_CHECKBOX_TS_SNIPPET;

  // 2 [Reactive Form with Checkbox]
  codeForReactiveFormCheckbox = REACTIVE_FORM_CHECKBOX_HTML_SNIPPET;
  codeForReactiveFormCheckboxTs = REACTIVE_FORM_CHECKBOX_TS_SNIPPET;

  //   reactive form
  toppings = this._formBuilder.group({
    pepperoni: false,
    extracheese: false,
    mushroom: false,
  });

  constructor(private _formBuilder: FormBuilder) {}

  //   config
  checked = false;
  indeterminate = false;
  labelPosition: 'before' | 'after' = 'after';
  disabled = false;

  //   basic
  readonly task = signal<Task>({
    name: 'Parent task',
    completed: false,
    subtasks: [
      {name: 'Child task 1', completed: false},
      {name: 'Child task 2', completed: false},
      {name: 'Child task 3', completed: false},
    ],
  });

  readonly partiallyComplete = computed(() => {
    const task = this.task();
    if (!task.subtasks) {
      return false;
    }
    return task.subtasks.some(t => t.completed) && !task.subtasks.every(t => t.completed);
  });

  update(completed: boolean, index?: number) {
    this.task.update(task => {
      if (index === undefined) {
        task.completed = completed;
        task.subtasks?.forEach(t => (t.completed = completed));
      } else {
        task.subtasks![index].completed = completed;
        task.completed = task.subtasks?.every(t => t.completed) ?? true;
      }
      return {...task};
    });
  }
}
