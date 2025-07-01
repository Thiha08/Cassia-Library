import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-payments',
  imports: [MaterialModule, TablerIconsModule],
  templateUrl: './payments.component.html',
})
export class AppPaymentsComponent {}
