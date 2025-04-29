import { Component, Input, ViewChild } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { init } from 'echarts';
import * as moment from 'moment';

@Component({
  selector: 'app-integration-operations-chart',
  templateUrl: './integration-operations-chart.component.html',
  styleUrls: ['./integration-operations-chart.component.scss'],
})
export class IntegrationOperationsChartComponent {
  @Input() totalData: any;
  @Input() filterDuration: any;

  @ViewChild('runChart', { static: true }) chart;
  options: EChartsOption = {
    color: ['#D92D20', '#039855', '#0F61B3'],
    legend: { left: 'left', pageButtonPosition: 'start', icon: 'circle' },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        name: 'TimeFrame',
        nameLocation: 'middle',
        nameGap: 25,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        name: 'Total',
        nameLocation: 'middle',
        nameGap: 35,
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Failed',
        type: 'bar',
        barWidth: '8%',
        data: [8, 2, 7, 3, 5, 9, 12],
        barGap: '70%',
        barCategoryGap: '70%',
      },
      {
        name: 'Succeeded',
        type: 'bar',
        barWidth: '8%',
        data: [19, 12, 17, 30, 23, 20, 22],
        barGap: '70%',
        barCategoryGap: '70%',
      },
      {
        name: 'Processing',
        type: 'bar',
        barWidth: '8%',
        data: [11, 17, 15, 13, 13, 10, 6],
        barGap: '70%',
        barCategoryGap: '70%',
      },
    ],
  };

  intervalMap = {
    day: 24,
    week: 7,
    month: 30,
  };

  ngOnChanges() {
    this.totalData = this.totalData || [];
    this.filterDuration = this.filterDuration || 'day';
    this.generateOptions(new Date());
  }

  getDateOptions(date: any) {
    const currHour = date.getHours();
    const hours = [];

    for (let i = currHour + 1; i < 24; i++) {
      hours.push(i < 10 ? `0${i}:00` : `${i}:00`);
    }
    for (let i = 0; i <= currHour; i++) {
      hours.push(i < 10 ? `0${i}:00` : `${i}:00`);
    }

    return hours;
  }

  getWeekOptions(date: any) {
    const res = [];

    for (let i = 7; i >= 0; i--) {
      res.push(moment(date).subtract(i, 'days').format('DD/MM/YYYY'));
    }

    return res;
  }

  getMonthOptions(date: any) {
    const res = [];

    for (let i = 30; i >= 0; i--) {
      res.push(moment(date).subtract(i, 'days').format('DD/MM/YYYY'));
    }

    return res;
  }

  getIntervals(date) {
    switch (this.filterDuration) {
      case 'day':
        return this.getDateOptions(date);
      case 'week':
        return this.getWeekOptions(date);
      case 'month':
        return this.getMonthOptions(date);
    }
  }

  filterData(date: any, options: any) {
    const totalData = JSON.parse(JSON.stringify(this.totalData));
    const data = [];

    for (let i = 0; i < this.intervalMap[this.filterDuration]; i++) {
      data.push(0);
    }
    const countsByStatus = {
      failed: [...data],
      succeeded: [...data],
      processing: [...data],
    };
    const diffMap = {
      day: 'hours',
      week: 'days',
      month: 'weeks',
    };

    totalData.forEach((x) => {
      const tempData = countsByStatus[x.status.toLowerCase()];

      if (this.filterDuration === 'day') {
        const diff = moment(date).diff(
          moment(x.startTime),
          diffMap[this.filterDuration],
        );

        tempData[tempData.length - diff - 1] += 1;
      } else {
        const startDate = moment(x.startTime).local().format('DD/MM/YYYY');
        const index = options.findIndex((x) => x === startDate);

        tempData[index] += 1;
      }
    });

    return countsByStatus;
  }

  generateOptions(date) {
    const interval = this.getIntervals(date);
    const counts = this.filterData(date, interval);

    this.options.xAxis[0].data = interval;
    this.options.series[0].data = counts.failed;
    this.options.series[1].data = counts.succeeded;
    this.options.series[2].data = counts.processing;
    const chartRef = init(this.chart.nativeElement);

    chartRef.setOption(this.options);
  }
}
