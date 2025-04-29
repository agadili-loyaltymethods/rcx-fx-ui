import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingSucceededIntegrationsComponent } from './processing-succeeded-integrations.component';

describe('ProcessingSucceededIntegrationsComponent', () => {
  let component: ProcessingSucceededIntegrationsComponent;
  let fixture: ComponentFixture<ProcessingSucceededIntegrationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessingSucceededIntegrationsComponent],
    });
    fixture = TestBed.createComponent(ProcessingSucceededIntegrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
