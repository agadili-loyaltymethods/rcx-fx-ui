import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationOperationsChartComponent } from './integration-operations-chart.component';

describe('IntegrationOperationsChartComponent', () => {
  let component: IntegrationOperationsChartComponent;
  let fixture: ComponentFixture<IntegrationOperationsChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegrationOperationsChartComponent],
    });
    fixture = TestBed.createComponent(IntegrationOperationsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
