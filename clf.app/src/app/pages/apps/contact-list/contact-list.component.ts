import { Component } from '@angular/core';
import { AppListingComponent } from 'src/app/pages/apps/contact-list/listing/listing.component';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-contact-list',
  imports: [AppListingComponent, TablerIconsModule, MaterialModule],
  templateUrl: './contact-list.component.html',
})
export class AppContactListComponent {}
