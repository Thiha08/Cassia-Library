import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-banners',
    imports: [MatCardModule, MatButtonModule],
    templateUrl: './banners.component.html'
})
export class AppBannersComponent {
  constructor() {}
}
