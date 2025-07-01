import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-added-dialog',
    templateUrl: './added-dialog.component.html',
    imports: [MatDialogModule, MatButtonModule]
})
export class AddedDialogComponent {
  constructor() {}
}
