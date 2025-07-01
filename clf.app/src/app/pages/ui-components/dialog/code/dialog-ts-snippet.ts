export const DIALOG_ANIMATION_TS_SNIPPET = `  import {Component} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
    import {
      MatDialog,
      MatDialogRef,
      MatDialogActions,
      MatDialogClose,
      MatDialogTitle,
      MatDialogContent,
      MatDialogModule,
    } from '@angular/material/dialog';

    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-dialog',
        templateUrl: 'dialog.component.html',
        imports: [
          MatButtonModule,
          MatDialogActions,
          MatDialogClose,
          MatDialogTitle,
          MatDialogContent,
          MatDialogModule,
        ],
        changeDetection: ChangeDetectionStrategy.OnPush
    })

    //  1
    @Component({
        selector: 'dialog-overview',
        imports: [MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatButtonModule],
        templateUrl: 'dialog-overview.component.html'
    })
    export class AppDialogOverviewComponent {
      constructor(public dialogRef: MatDialogRef<AppDialogOverviewComponent>) {}
    }

    export class AppDialogComponent {
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
    }
`;


export const DIALOG_SCROLLABLE_TS_SNIPPET = `  import {Component} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
    import {
      MatDialog,
      MatDialogRef,
      MatDialogActions,
      MatDialogClose,
      MatDialogTitle,
      MatDialogContent,
      MatDialogModule,
    } from '@angular/material/dialog';

    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-dialog',
        templateUrl: 'dialog.component.html',
        imports: [
          MatButtonModule,
          MatDialogActions,
          MatDialogClose,
          MatDialogTitle,
          MatDialogContent,
          MatDialogModule,
        ],
        changeDetection: ChangeDetectionStrategy.OnPush
    })

    /**
     * @title 2 Dialog with header, scrollable content and actions
     */
    @Component({
        selector: 'dialog-content',
        imports: [MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatButtonModule],
        templateUrl: 'dialog-content.component.html'
    })
    export class AppDialogContentComponent {}

    export class AppDialogComponent {
        // 2
          openHeaderDialog() {
            const dialogRef = this.dialog.open(AppDialogContentComponent);
        
            dialogRef.afterClosed().subscribe((result) => {
              console.log('Dialog result: result');
            });
          }
    }
`;


export const DIALOG_INJECTING_TS_SNIPPET = `  import {Component} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
    import {
      MatDialog,
      MatDialogRef,
      MatDialogActions,
      MatDialogClose,
      MatDialogTitle,
      MatDialogContent,
      MatDialogModule,
    } from '@angular/material/dialog';

    export interface DialogData {
      animal: 'panda' | 'unicorn' | 'lion';
    }

    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-dialog',
        templateUrl: 'dialog.component.html',
        imports: [
          MatButtonModule,
          MatDialogActions,
          MatDialogClose,
          MatDialogTitle,
          MatDialogContent,
          MatDialogModule,
        ],
        changeDetection: ChangeDetectionStrategy.OnPush
    })

    // 3
    @Component({
        selector: 'dialog-data-example-dialog',
        imports: [MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatButtonModule],
        templateUrl: 'dialog-data.component.html'
    })
    export class AppDialogDataComponent {
      constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
    }

    export class AppDialogComponent {
        // 3
          openInjectDialog() {
            this.dialog.open(AppDialogDataComponent, {
              data: {
                animal: 'panda',
              },
            });
          }
    }
`;


export const DIALOG_MENU_TS_SNIPPET = `  import {Component} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
    import {
      MatDialog,
      MatDialogRef,
      MatDialogActions,
      MatDialogClose,
      MatDialogTitle,
      MatDialogContent,
      MatDialogModule,
    } from '@angular/material/dialog';

    /**
     * @title chips overview
     */
    @Component({
        selector: 'app-dialog',
        templateUrl: 'dialog.component.html',
        imports: [
          MatButtonModule,
          MatDialogActions,
          MatDialogClose,
          MatDialogTitle,
          MatDialogContent,
          MatDialogModule,
        ],
        changeDetection: ChangeDetectionStrategy.OnPush
    })

    // 4
    @Component({
        selector: 'dialog-menu',
        imports: [MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatButtonModule],
        templateUrl: 'dialog-menu.component.html'
    })
    export class AppDialogMenuComponent {}

    export class AppDialogComponent {
        // 4
        @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
      
        constructor(public dialog: MatDialog) {}

        openMenuDialog() {
            const dialogRef = this.dialog.open(AppDialogMenuComponent, {
              restoreFocus: false,
            });
        
            // Manually restore focus to the menu trigger since the element that
            // opens the dialog won't be in the DOM any more when the dialog closes.
            dialogRef.afterClosed().subscribe(() => this.menuTrigger.focus());
        }
    }
`;


export const DIALOG_OVERVIEW_TS_SNIPPET = `  import {Component} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
    import {
      MatDialog,
      MatDialogRef,
      MatDialogActions,
      MatDialogClose,
      MatDialogTitle,
      MatDialogContent,
      MatDialogModule,
    } from '@angular/material/dialog';

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
        changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class DialogOverviewExampleDialog {
      readonly dialogRef = inject(MatDialogRef<DialogOverviewExampleDialog>);
      readonly data = inject<DialogData2>(MAT_DIALOG_DATA);
      readonly animal = model(this.data.animal);
    
      onNoClick(): void {
        this.dialogRef.close();
      }
    }

    // 5

    export interface DialogData2 {
      animal: any;
      name: string;
    }

    export class AppDialogComponent {
        // 5
          readonly animal = signal('');
          readonly name = model('');
          readonly dialogEx = inject(MatDialog);
        
          openDialogEx(): void {
            const dialogRef = this.dialogEx.open(DialogOverviewExampleDialog, {
              data: {name: this.name(), animal: this.animal()},
            });
        
            dialogRef.afterClosed().subscribe(result => {
              console.log('The dialog was closed');
              if (result !== undefined) {
                this.animal.set(result);
              }
            });
          }
    }
`;