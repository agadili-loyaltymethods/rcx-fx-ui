import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditIntegrationParameterComponent } from './create-edit-integration-parameter.component';

describe('CreateEditAlertComponent', () => {
  let component: CreateEditIntegrationParameterComponent;
  let fixture: ComponentFixture<CreateEditIntegrationParameterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditIntegrationParameterComponent],
    });
    fixture = TestBed.createComponent(CreateEditIntegrationParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
