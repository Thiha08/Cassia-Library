import { Component, ViewChild } from '@angular/core';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { COLUMN_CHART_HTML_SNIPPET } from './code/column-html-snippet';
import { COLUMN_CHART_TS_SNIPPET } from './code/column-ts-snippet';

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
    selector: 'app-column',
    imports: [NgApexchartsModule, MaterialModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './column.component.html'
})

export class AppColumnChartComponent {

  // 1 [column with Datepicker]
  codeForColumnChart = COLUMN_CHART_HTML_SNIPPET;
  codeForColumnChartTs = COLUMN_CHART_TS_SNIPPET;


  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public columnChartOptions: Partial<ChartOptions> | any;
  constructor() {
    //Column chart.
    this.columnChartOptions = {
      series: [
        {
          name: 'A',
          data: [400, 120, 140, 130, 200, 150, 140, 130, 300, 120, 140, 150],
        },
        {
          name: 'B',
          data: [200, 188, 242, 300, 200, 400, 230, 300, 200, 400, 180, 300],
        },
        {
          name: 'C',
          data: [100, 200, 400, 600, 100, 200, 400, 370, 240, 200, 280, 330],
        },
      ],
      chart: {
        fontFamily: 'DM Sans,sans-serif',
        foreColor: '#a1aab2',
        height: 300,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '40%',
          barHeight: '40%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 3,
      },
      stroke: {
        curve: 'straight',
        width: '0',
      },
      colors: ['#398bf7', '#06d79c'],
      legend: {
        show: true,
      },
      grid: {
        show: true,
        strokeDashArray: 0,
        borderColor: 'rgba(0,0,0,0.1)',
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        type: 'category',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      },
      tooltip: {
        theme: 'dark',
      },
    };
  }
}
