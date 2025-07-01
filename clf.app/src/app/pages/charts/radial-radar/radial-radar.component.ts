import { Component, ViewChild } from '@angular/core';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { RADAR_CHART_HTML_SNIPPET, RADIALBAR_CHART_HTML_SNIPPET } from './code/radial-radar-html-snippet';
import { RADAR_CHART_TS_SNIPPET, RADIALBAR_CHART_TS_SNIPPET } from './code/radial-radar-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';


import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexXAxis,
  ApexTooltip,
  ApexTheme,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MaterialModule } from '../../../material.module';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: any;
  theme: ApexTheme;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors: string[];
  markers: any;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  labels: string[];
};

@Component({
    selector: 'app-radial-radar',
    imports: [NgApexchartsModule, MaterialModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './radial-radar.component.html'
})
export class AppRadialRadarChartComponent {

  // 1 [Radialbar with Datepicker]
  codeForRadialbarChart = RADIALBAR_CHART_HTML_SNIPPET;
  codeForRadialbarChartTs = RADIALBAR_CHART_TS_SNIPPET;

  // 2 [Radar with Datepicker]
  codeForRadarChart = RADAR_CHART_HTML_SNIPPET;
  codeForRadarChartTs = RADAR_CHART_TS_SNIPPET;


  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public radialbarChartOptions: Partial<ChartOptions> | any;
  public radarChartOptions: Partial<ChartOptions> | any;

  constructor() {
    //radialbar chart.
    this.radialbarChartOptions = {
      series: [44, 55, 67, 83],
      chart: {
        id: 'radial-chart',
        type: 'radialBar',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
      },
      colors: ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F'],
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
            },
            total: {
              show: true,
              label: 'Total',
              formatter() {
                return 249;
              },
            },
          },
        },
      },
      tooltip: {
        theme: 'dark',
      },
    };

    //radialbar chart.
    this.radarChartOptions = {
      series: [
        {
          name: 'Sales',
          data: [80, 50, 30, 40, 100, 20],
        },
      ],
      chart: {
        id: 'pie-chart',
        type: 'radar',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        toolbar: {
          show: false,
        },
      },
      colors: ['#5D87FF'],
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      tooltip: {
        theme: 'dark',
      },
    };
  }
}
