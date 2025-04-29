import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunHistoryDialogComponent } from './run-history-dialog.component';

describe('RunHistoryDialogComponent', () => {
  let component: RunHistoryDialogComponent;
  let fixture: ComponentFixture<RunHistoryDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RunHistoryDialogComponent],
    });
    fixture = TestBed.createComponent(RunHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
