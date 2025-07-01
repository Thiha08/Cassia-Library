// city-stats-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-city-stats-dialog',
  template: `
    <h1 mat-dialog-title>City Details: {{ data.name }}</h1>
    <div mat-dialog-content>
      <p><strong>Population:</strong> {{ data.stats.population }}</p>
      <p><strong>Area:</strong> {{ data.stats.area }}</p>
    </div>
  `,
})
export class CityStatsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
