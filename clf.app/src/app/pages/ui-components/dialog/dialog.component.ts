import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewChild,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

// snippets
import {
  DIALOG_ANIMATION_HTML_SNIPPET,
  DIALOG_INJECTING_HTML_SNIPPET,
  DIALOG_MENU_HTML_SNIPPET,
  DIALOG_OVERVIEW_HTML_SNIPPET,
  DIALOG_SCROLLABLE_HTML_SNIPPET,
} from './code/dialog-html-snippet';
import {
  DIALOG_ANIMATION_TS_SNIPPET,
  DIALOG_INJECTING_TS_SNIPPET,
  DIALOG_MENU_TS_SNIPPET,
  DIALOG_OVERVIEW_TS_SNIPPET,
  DIALOG_SCROLLABLE_TS_SNIPPET,
} from './code/dialog-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

//  1
@Component({
  selector: 'dialog-overview',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
  ],
  templateUrl: 'dialog-overview.component.html',
})
export class AppDialogOverviewComponent {
  constructor(public dialogRef: MatDialogRef<AppDialogOverviewComponent>) {}
}

/**
 * @title 2 Dialog with header, scrollable content and actions
 */
@Component({
  selector: 'dialog-content',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
  ],
  templateUrl: 'dialog-content.component.html',
})
export class AppDialogContentComponent {}

// 3
@Component({
  selector: 'dialog-data-example-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
  ],
  templateUrl: 'dialog-data.component.html',
})
export class AppDialogDataComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}

// 4
@Component({
  selector: 'dialog-menu',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatButtonModule,
  ],
  templateUrl: 'dialog-menu.component.html',
})
export class AppDialogMenuComponent {}

// 5

export interface DialogData2 {
  animal: any;
  name: string;
}

@Component({
  selector: 'dialog-form-overview',
  templateUrl: 'dialog-form-overview.component.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogOverviewExampleDialog {
  readonly dialogRef = inject(MatDialogRef<DialogOverviewExampleDialog>);
  readonly data = inject<DialogData2>(MAT_DIALOG_DATA);
  readonly animal = model(this.data.animal);

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-dialog',
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    AppCodeViewComponent,
  ],
  templateUrl: './dialog.component.html',
})
export class AppDialogComponent {
  // 1 [dialog with Animations]
  codeFordialogAnimations = DIALOG_ANIMATION_HTML_SNIPPET;
  codeFordialogAnimationsTs = DIALOG_ANIMATION_TS_SNIPPET;

  // 2 [Scrollable with dialog]
  codeForScrollable = DIALOG_SCROLLABLE_HTML_SNIPPET;
  codeForScrollableTs = DIALOG_SCROLLABLE_TS_SNIPPET;

  // 3 [Injecting with dialog]
  codeForInjecting = DIALOG_INJECTING_HTML_SNIPPET;
  codeForInjectingTs = DIALOG_INJECTING_TS_SNIPPET;

  // 4 [menu with dialog]
  codeForMenu = DIALOG_MENU_HTML_SNIPPET;
  codeForMenuTs = DIALOG_MENU_TS_SNIPPET;

  // 5 [menu with dialog]
  codeForOverview = DIALOG_OVERVIEW_HTML_SNIPPET;
  codeForOverviewTs = DIALOG_OVERVIEW_TS_SNIPPET;

  // 4
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(public dialog: MatDialog) {}

  // 5
  readonly animal = signal('');
  readonly name = model('');
  readonly dialogEx = inject(MatDialog);

  openDialogEx(): void {
    const dialogRef = this.dialogEx.open(DialogOverviewExampleDialog, {
      data: { name: this.name(), animal: this.animal() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.animal.set(result);
      }
    });
  }

  // 1
  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(AppDialogOverviewComponent, {
      width: '290px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  // 2
  openHeaderDialog() {
    const dialogRef = this.dialog.open(AppDialogContentComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  // 3
  openInjectDialog() {
    this.dialog.open(AppDialogDataComponent, {
      data: {
        animal: 'panda',
      },
    });
  }

  // 4

  openMenuDialog() {
    const dialogRef = this.dialog.open(AppDialogMenuComponent, {
      restoreFocus: false,
    });

    // Manually restore focus to the menu trigger since the element that
    // opens the dialog won't be in the DOM any more when the dialog closes.
    dialogRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }
}
