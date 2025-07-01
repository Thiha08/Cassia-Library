import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-welcome-card',
  imports: [MaterialModule],
  templateUrl: './welcome-card.component.html',
})
export class AppWelcomeCardComponent {}
