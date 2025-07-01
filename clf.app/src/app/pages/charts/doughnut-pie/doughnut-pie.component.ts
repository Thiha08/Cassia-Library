import { Component, ViewChild } from '@angular/core';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { DOUGHNUT_CHART_HTML_SNIPPET, PIE_CHART_HTML_SNIPPET } from './code/doughnut-pie-html-snippet';
import { DOUGHNUT_CHART_TS_SNIPPET, PIE_CHART_TS_SNIPPET } from './code/doughnut-pie-ts-snippet';

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
    selector: 'app-doughnut-pie',
    imports: [NgApexchartsModule, MaterialModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './doughnut-pie.component.html'
})
export class AppDoughnutpieChartComponent {

  // 1 [Doughnut with Datepicker]
  codeForDoughnutChart = DOUGHNUT_CHART_HTML_SNIPPET;
  codeForDoughnutChartTs = DOUGHNUT_CHART_TS_SNIPPET;

  // 2 [Pie with Datepicker]
  codeForPieChart = PIE_CHART_HTML_SNIPPET;
  codeForPieChartTs = PIE_CHART_TS_SNIPPET;

  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public doughnutChartOptions: Partial<ChartOptions> | any;
  public pieChartOptions: Partial<ChartOptions> | any;

  constructor() {
    //doughnut chart.
    this.doughnutChartOptions = {
      series: [45, 15, 27, 18, 35],
      chart: {
        id: 'donut-chart',
        type: 'donut',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70px',
          },
        },
      },
      legend: {
        show: true,
        position: 'bottom',
        width: '50px',
      },
      colors: ['#5D87FF', '#ECF2FF', '#49BEFF', '#E8F7FF', '#FFAE1F'],
      tooltip: {
        theme: 'dark',
        fillSeriesColor: false,
      },
    };

     //pie chart.
    this.pieChartOptions = {
      series: [45, 15, 27, 18, 35],
      chart: {
        id: 'pie-chart',
        type: 'pie',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70px',
          },
        },
      },
      legend: {
        show: true,
        position: 'bottom',
        width: '50px',
      },
      colors: ['#5D87FF', '#ECF2FF', '#49BEFF', '#E8F7FF', '#FFAE1F'],
      tooltip: {
        fillSeriesColor: false,
      },
    };
  }
}
