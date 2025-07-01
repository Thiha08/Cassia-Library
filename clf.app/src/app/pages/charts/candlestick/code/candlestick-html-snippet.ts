export const CANDLESTICK_CHART_HTML_SNIPPET = `  <apx-chart [series]="candlestickChartOptions.series" [chart]="candlestickChartOptions.chart"
      [xaxis]="candlestickChartOptions.xaxis" [yaxis]="candlestickChartOptions.yaxis"
      [grid]="candlestickChartOptions.grid" [stroke]="candlestickChartOptions.stroke"
      [tooltip]="candlestickChartOptions.tooltip" [plotOptions]="candlestickChartOptions.plotOptions"
      [dataLabels]="candlestickChartOptions.dataLabels" [legend]="candlestickChartOptions.legend"
      [colors]="candlestickChartOptions.colors" [markers]="candlestickChartOptions.markers">
    </apx-chart>
`;