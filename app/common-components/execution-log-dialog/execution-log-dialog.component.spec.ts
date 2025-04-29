import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionLogDialogComponent } from './execution-log-dialog.component';

describe('ExecutionLogDialogComponent', () => {
  let component: ExecutionLogDialogComponent;
  let fixture: ComponentFixture<ExecutionLogDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExecutionLogDialogComponent],
    });
    fixture = TestBed.createComponent(ExecutionLogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
