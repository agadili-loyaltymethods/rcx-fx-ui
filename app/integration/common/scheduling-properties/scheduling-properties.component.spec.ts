import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingPropertiesComponent } from './scheduling-properties.component';

describe('SchedulingPropertiesComponent', () => {
  let component: SchedulingPropertiesComponent;
  let fixture: ComponentFixture<SchedulingPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchedulingPropertiesComponent],
    });
    fixture = TestBed.createComponent(SchedulingPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
