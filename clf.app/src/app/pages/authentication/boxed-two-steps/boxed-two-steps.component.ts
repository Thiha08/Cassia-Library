import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';

@Component({
    selector: 'app-boxed-two-steps',
    imports: [RouterModule, MaterialModule, BrandingComponent],
    templateUrl: './boxed-two-steps.component.html'
})
export class AppBoxedTwoStepsComponent {
  options = this.settings.getOptions();
  
  constructor(private settings: CoreService) {}
}
