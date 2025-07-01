export const RADIALBAR_CHART_TS_SNIPPET = `  import { Component, ViewChild } from '@angular/core';
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
     * @title Radialbar Chart */
     */
    @Component({
        selector: 'app-radial-radar',
        imports: [NgApexchartsModule, MaterialModule],
        templateUrl: './radial-radar.component.html'
    })
    export class AppRadialRadarChartComponent {

      @ViewChild('chart') chart: ChartComponent = Object.create(null);
      public radialbarChartOptions: Partial<ChartOptions> | any;

      constructor() {
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
      }
`;

export const RADAR_CHART_TS_SNIPPET = `  import { Component, ViewChild } from '@angular/core';
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
     * @title Radar Chart */
     */
    @Component({
        selector: 'app-radial-radar',
        imports: [NgApexchartsModule, MaterialModule],
        templateUrl: './radial-radar.component.html'
    })
    export class AppRadialRadarChartComponent {

      @ViewChild('chart') chart: ChartComponent = Object.create(null);
      public radarChartOptions: Partial<ChartOptions> | any;

      constructor() {
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
`;