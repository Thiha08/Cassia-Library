export const DOUGHNUT_CHART_TS_SNIPPET = `  import { Component, ViewChild } from '@angular/core';
    import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

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

    /**
     * @title doughnut Chart */
     */
    @Component({
        selector: 'app-doughnut-pie',
        imports: [NgApexchartsModule, MaterialModule],
        templateUrl: './doughnut-pie.component.html'
    })
    export class AppDoughnutpieChartComponent {

      @ViewChild('chart') chart: ChartComponent = Object.create(null);
      public doughnutChartOptions: Partial<ChartOptions> | any;

        constructor() {
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
        }
`;


export const PIE_CHART_TS_SNIPPET = `  import { Component, ViewChild } from '@angular/core';
    import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

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

    /**
     * @title doughnut Chart */
     */
    @Component({
        selector: 'app-doughnut-pie',
        imports: [NgApexchartsModule, MaterialModule],
        templateUrl: './doughnut-pie.component.html'
    })
    export class AppDoughnutpieChartComponent {

      @ViewChild('chart') chart: ChartComponent = Object.create(null);
      public pieChartOptions: Partial<ChartOptions> | any;

        constructor() {
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
`;