import moment from 'moment';

export const formatDateTime = (value: string | Date): string => {
  if (!value) {
    return '';
  }
  return moment(value).format('MMM DD, YYYY hh:mm A');
};