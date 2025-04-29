import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationPropertiesMenuComponent } from './integration-properties-menu.component';

describe('IntegrationPropertiesMenuComponent', () => {
  let component: IntegrationPropertiesMenuComponent;
  let fixture: ComponentFixture<IntegrationPropertiesMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegrationPropertiesMenuComponent],
    });
    fixture = TestBed.createComponent(IntegrationPropertiesMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
