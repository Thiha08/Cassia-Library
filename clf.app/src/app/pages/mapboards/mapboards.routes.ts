import { Routes } from '@angular/router';
import { AppMapboard1Component } from './mapboard1/mapboard1.component';
import { AppMapboard2Component } from './mapboard2/mapboard2.component';
import { AppMapboard3Component } from './mapboard3/mapboard3.component';
import { AppMapboard4Component } from './mapboard4/mapboard4.component';
import { AppMapboard5Component } from './mapboard5/mapboard5.component';
import { AppMapboard6Component } from './mapboard6/mapboard6.component';
import { AppMapboard7Component } from './mapboard7/mapboard7.component';


export const MapboardsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'mapboard1',
        component: AppMapboard1Component,
        data: {
          title: 'Analytical',
          urls: [
            { title: 'Mapboard I', url: '/mapboards/mapboard1' },
            { title: 'Analytical' },
          ],
        },
      },
      {
        path: 'mapboard2',
        component: AppMapboard2Component,
        data: {
          title: 'Analytical',
          urls: [
            { title: 'Mapboard II', url: '/mapboards/mapboard2' },
            { title: 'Analytical' },
          ],
        },
      },
      {
        path: 'mapboard3',
        component: AppMapboard3Component,
        data: {
          title: 'Analytical',
          urls: [
            { title: 'Mapboard III', url: '/mapboards/mapboard3' },
            { title: 'Analytical' },
          ],
        },
      },
      {
        path: 'mapboard4',
        component: AppMapboard4Component,
        data: {
          title: 'Analytical',
          urls: [
            { title: 'Mapboard IV', url: '/mapboards/mapboard4' },
            { title: 'Analytical' },
          ],
        },
      },
      {
        path: 'mapboard5',
        component: AppMapboard5Component,
        data: {
          title: 'Analytical',
          urls: [
            { title: 'Mapboard V', url: '/mapboards/mapboard5' },
            { title: 'Analytical' },
          ],
        },
      },
      {
        path: 'mapboard6',
        component: AppMapboard6Component,
        data: {
          title: 'Analytical',
          urls: [
            { title: 'Mapboard VI', url: '/mapboards/mapboard6' },
            { title: 'Analytical' },
          ],
        },
      },
      {
        path: 'mapboard7',
        component: AppMapboard7Component,
        data: {
          title: 'Analytical',
          urls: [
            { title: 'Mapboard VII', url: '/mapboards/mapboard7' },
            { title: 'Analytical' },
          ],
        },
      },
    ],
  },
];
