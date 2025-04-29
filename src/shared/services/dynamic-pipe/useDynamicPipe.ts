import { useCallback } from 'react';
import moment from 'moment';

export const useDynamicPipe = () => {
  const formatDate = useCallback((value: string, locale: string, format: string) => {
    return moment(value).format(format);
  }, []);

  const formatNumber = useCallback((value: number, locale: string, digitInfo: string) => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: parseInt(digitInfo.split('-')[0]),
      maximumFractionDigits: parseInt(digitInfo.split('-')[1]),
    }).format(value);
  }, []);

  const utcDate = useCallback((value: string) => {
    return moment(new Date(value)).format('MMM D, YYYY h:mm A');
  }, []);

  const dateOnly = useCallback((value: string) => {
    return moment(value).format('yyyy-MM-DD');
  }, []);

  const dateTimeFormat = useCallback((value: string) => {
    return moment(value).format('MMM DD, YYYY hh:mm A');
  }, []);

  const longDateTimeFormat = useCallback((value: string) => {
    return moment(value).format('LLL');
  }, []);

  const radix = useCallback((value: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
    return formatter.format(value);
  }, []);

  const duration = useCallback((value: number) => {
    let result = '';
    if (value >= 3600) {
      const hours = Math.floor(value / 3600);
      result = hours + 'h ';
      value %= 3600;
    }
    if (value >= 60) {
      const minutes = Math.floor(value / 60);
      result += minutes + 'm ';
      value %= 60;
    }
    if (value) {
      result += Math.floor(value) + 's';
    }
    return result.trim();
  }, []);

  return {
    formatDate,
    formatNumber,
    utcDate,
    dateOnly,
    dateTimeFormat,
    longDateTimeFormat,
    radix,
    duration,
  };
};