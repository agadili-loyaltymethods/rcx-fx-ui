import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsPropertiesComponent } from './alerts-properties.component';

describe('AlertsPropertiesComponent', () => {
  let component: AlertsPropertiesComponent;
  let fixture: ComponentFixture<AlertsPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlertsPropertiesComponent],
    });
    fixture = TestBed.createComponent(AlertsPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
