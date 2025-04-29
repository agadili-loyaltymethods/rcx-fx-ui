import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RcxFieldSelectionComponent } from './rcx-field-selection.component';

describe('RcxFieldSelectionComponent', () => {
  let component: RcxFieldSelectionComponent;
  let fixture: ComponentFixture<RcxFieldSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RcxFieldSelectionComponent],
    });
    fixture = TestBed.createComponent(RcxFieldSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
