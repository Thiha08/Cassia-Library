import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import {MatDividerModule} from '@angular/material/divider';

@Component({
    selector: 'app-account-setting',
    imports: [MatCardModule, MatIconModule, TablerIconsModule, MatTabsModule, MatFormFieldModule, MatSlideToggleModule, MatSelectModule, MatInputModule, MatButtonModule, MatDividerModule],
    templateUrl: './account-setting.component.html'
})
export class AppAccountSettingComponent {
  constructor() {}
} 
