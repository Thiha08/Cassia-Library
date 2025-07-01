import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MapboardsRoutes } from './mapboards.routes';
import { AppMapboard1Component } from './mapboard1/mapboard1.component';
import { AppMapboard2Component } from './mapboard2/mapboard2.component';
import { AppMapboard3Component } from './mapboard3/mapboard3.component';
import { AppMapboard4Component } from './mapboard4/mapboard4.component';
import { AppMapboard5Component } from './mapboard5/mapboard5.component';
import { AppMapboard6Component } from './mapboard6/mapboard6.component';
import { AppMapboard7Component } from './mapboard7/mapboard7.component';

@NgModule({
  imports: [
    RouterModule.forChild(MapboardsRoutes),
    AppMapboard1Component,
    AppMapboard2Component,
    AppMapboard3Component,
    AppMapboard4Component,
    AppMapboard5Component,
    AppMapboard6Component,
    AppMapboard7Component
  ],
})
export class MapboardsModule { }
