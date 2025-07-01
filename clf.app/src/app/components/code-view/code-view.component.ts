import { Component, OnInit, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-code-view',
  templateUrl: './code-view.component.html',
  imports: [MatTabsModule, MatCardModule],
})
export class AppCodeViewComponent implements OnInit {
  constructor() {}
  @Input() isTitle!: boolean;
  ngOnInit(): void {}
}
