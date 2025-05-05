import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import moment from 'moment';

interface IntegrationOperationsChartProps {
  totalData: any[];
  filterDuration: string;
}

const IntegrationOperationsChart: React.FC<IntegrationOperationsChartProps> = ({
  totalData,
  filterDuration,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  const intervalMap = {
    day: 24,
    week: 7,
    month: 30,
  };

  const getDateOptions = (date: Date) => {
    const currHour = date.getHours();
    const hours = [];

    for (let i = currHour + 1; i < 24; i++) {
      hours.push(i < 10 ? `0${i}:00` : `${i}:00`);
    }
    for (let i = 0; i <= currHour; i++) {
      hours.push(i < 10 ? `0${i}:00` : `${i}:00`);
    }

    return hours;
  };

  const getWeekOptions = (date: Date) => {
    const res = [];
    for (let i = 7; i >= 0; i--) {
      res.push(moment(date).subtract(i, 'days').format('DD/MM/YYYY'));
    }
    return res;
  };

  const getMonthOptions = (date: Date) => {
    const res = [];
    for (let i = 30; i >= 0; i--) {
      res.push(moment(date).subtract(i, 'days').format('DD/MM/YYYY'));
    }
    return res;
  };

  const getIntervals = (date: Date) => {
    switch (filterDuration) {
      case 'day':
        return getDateOptions(date);
      case 'week':
        return getWeekOptions(date);
      case 'month':
        return getMonthOptions(date);
      default:
        return [];
    }
  };

  const filterData = (date: Date, options: string[]) => {
    const data = new Array(intervalMap[filterDuration as keyof typeof intervalMap]).fill(0);
    
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
      const tempData = countsByStatus[x.status.toLowerCase() as keyof typeof countsByStatus];

      if (filterDuration === 'day') {
        const diff = moment(date).diff(
          moment(x.startTime),
          diffMap[filterDuration as keyof typeof diffMap] as moment.unitOfTime.Diff
        );
        tempData[tempData.length - diff - 1] += 1;
      } else {
        const startDate = moment(x.startTime).local().format('DD/MM/YYYY');
        const index = options.findIndex((x) => x === startDate);
        if (index !== -1) {
          tempData[index] += 1;
        }
      }
    });

    return countsByStatus;
  };

  const generateOptions = (date: Date) => {
    const interval = getIntervals(date);
    const counts = filterData(date, interval);

    const options: echarts.EChartsOption = {
      color: ['#D92D20', '#039855', '#0F61B3'],
      legend: { 
        left: 'left', 
        pageButtonPosition: 'start', 
        icon: 'circle' 
      },
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
      xAxis: [{
        type: 'category',
        name: 'TimeFrame',
        nameLocation: 'middle',
        nameGap: 25,
        data: interval,
        axisTick: {
          alignWithLabel: true,
        },
      }],
      yAxis: [{
        name: 'Total',
        nameLocation: 'middle',
        nameGap: 35,
        type: 'value',
      }],
      series: [
        {
          name: 'Failed',
          type: 'bar',
          barWidth: '8%',
          data: counts.failed,
          barGap: '70%',
          barCategoryGap: '70%',
        },
        {
          name: 'Succeeded',
          type: 'bar',
          barWidth: '8%',
          data: counts.succeeded,
          barGap: '70%',
          barCategoryGap: '70%',
        },
        {
          name: 'Processing',
          type: 'bar',
          barWidth: '8%',
          data: counts.processing,
          barGap: '70%',
          barCategoryGap: '70%',
        },
      ],
    };

    if (chartInstance.current) {
      chartInstance.current.setOption(options);
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (totalData && filterDuration) {
      generateOptions(new Date());
    }
  }, [totalData, filterDuration]);

  return (
    <div 
      ref={chartRef} 
      className="h-[500px] p-6"
    />
  );
};

export default IntegrationOperationsChart;