import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateFormatInfoComponent } from './date-format-info.component';

describe('DateFormatInfoComponent', () => {
  let component: DateFormatInfoComponent;
  let fixture: ComponentFixture<DateFormatInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DateFormatInfoComponent],
    });
    fixture = TestBed.createComponent(DateFormatInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
