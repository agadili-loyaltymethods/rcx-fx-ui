import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationGridComponent } from './integration-grid.component';

describe('IntegrationGridComponent', () => {
  let component: IntegrationGridComponent;
  let fixture: ComponentFixture<IntegrationGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegrationGridComponent],
    });
    fixture = TestBed.createComponent(IntegrationGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
