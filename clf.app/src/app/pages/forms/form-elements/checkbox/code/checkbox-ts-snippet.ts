export const BASIC_CHECKBOX_TS_SNIPPET = `  import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
    import { ThemePalette } from '@angular/material/core';
    import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
    import { CommonModule } from '@angular/common';

    export interface Task {
        name: string;
        completed: boolean;
        subtasks?: Task[];
    }

    /**
     * @title Basic checkboxes
     */
    @Component({
        selector: 'app-checkbox',
        imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './checkbox.component.html'
    })
    export class AppCheckboxComponent {
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
`;

export const CONFIGURABLE_CHECKBOX_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { ThemePalette } from '@angular/material/core';
    import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
    import { CommonModule } from '@angular/common';

    /**
     * @title Configurable checkbox
     */
    @Component({
        selector: 'app-checkbox',
        imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
        templateUrl: './checkbox.component.html'
    })
    export class AppCheckboxComponent {
        constructor() {}

        checked = false;
        indeterminate = false;
        labelPosition: 'before' | 'after' = 'after';
        disabled = false;
    }
`;

export const REACTIVE_FORM_CHECKBOX_TS_SNIPPET = `  import {Component} from '@angular/core';
    import { ThemePalette } from '@angular/material/core';
    import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
    import { CommonModule } from '@angular/common';

    /**
     * @title Configurable checkbox
     */
    @Component({
        selector: 'app-checkbox',
        imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
        templateUrl: './checkbox.component.html'
    })
    export class AppCheckboxComponent {
        constructor() {}

        toppings = this._formBuilder.group({
            pepperoni: false,
            extracheese: false,
            mushroom: false,
        });
    }
`;