import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorSidePanelComponent } from './error-side-panel.component';

describe('ErrorSidePanelComponent', () => {
  let component: ErrorSidePanelComponent;
  let fixture: ComponentFixture<ErrorSidePanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorSidePanelComponent],
    });
    fixture = TestBed.createComponent(ErrorSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
