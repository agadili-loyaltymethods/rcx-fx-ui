export const trimText = (value: string, limit: number = 15): string => {
  if (!value) {
    return '';
  }
  return value.length > 17 ? value.substring(0, limit) + '...' : value;
};