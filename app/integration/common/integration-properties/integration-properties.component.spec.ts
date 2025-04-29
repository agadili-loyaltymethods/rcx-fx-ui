import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationPropertiesComponent } from './integration-properties.component';

describe('IntegrationPropertiesComponent', () => {
  let component: IntegrationPropertiesComponent;
  let fixture: ComponentFixture<IntegrationPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegrationPropertiesComponent],
    });
    fixture = TestBed.createComponent(IntegrationPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
