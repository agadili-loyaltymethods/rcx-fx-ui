import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedIntegrationsComponent } from './failed-integrations.component';

describe('FailedIntegrationsComponent', () => {
  let component: FailedIntegrationsComponent;
  let fixture: ComponentFixture<FailedIntegrationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FailedIntegrationsComponent],
    });
    fixture = TestBed.createComponent(FailedIntegrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
