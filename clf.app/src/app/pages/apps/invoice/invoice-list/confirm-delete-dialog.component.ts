import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-delete-dialog',
    templateUrl: 'confirm-delete-dialog.component.html',
    imports: [MatDialogModule, MatButtonModule]
})
export class AppConfirmDeleteDialogComponent {
  constructor(private dialogRef: MatDialogRef<AppConfirmDeleteDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
