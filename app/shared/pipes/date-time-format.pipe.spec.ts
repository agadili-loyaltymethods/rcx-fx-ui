import { DateTimeFormatPipe } from './date-time-format.pipe';

fdescribe('DateTimeFormatPipe', () => {
  let pipe: DateTimeFormatPipe;

  beforeEach(() => {
    pipe = new DateTimeFormatPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should display the given date in utc date time format', () => {
    expect(pipe.transform('2019-12-20T11:23:00.000Z')).toBe(
      'Dec 20, 2019 4:53 PM',
    );
  });

  it('should return empty string when given is empty', () => {
    expect(pipe.transform('')).toBe('');
  });
});
