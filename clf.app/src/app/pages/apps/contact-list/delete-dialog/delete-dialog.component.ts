import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
@Component({
    selector: 'app-delete-dialog',
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './delete-dialog.component.html',
})
export class AppDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AppDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
