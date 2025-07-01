import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WikipediaService } from './wikipedia.service';

export interface WikiDialogData {
  coordinate: string; // e.g. "48°12′32″N 16°22′21″E"
}

@Component({
  selector: 'app-wiki-dialog',
  template: `
    <h1 mat-dialog-title>Wikipedia Info</h1>
    <div mat-dialog-content>
      <p>You clicked at: <strong>{{ data.coordinate }}</strong></p>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
})
export class WikiDialogComponent implements OnInit {
  summary: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: WikiDialogData,
    private wikiService: WikipediaService
  ) { }

  ngOnInit(): void {
    // Example: always fetch info for "Vienna"
    this.wikiService.getShortInfo('Vienna').subscribe((res) => {
      this.summary = res;
    });
  }
}
