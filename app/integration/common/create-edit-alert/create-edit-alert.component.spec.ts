import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditAlertComponent } from './create-edit-alert.component';

describe('CreateEditAlertComponent', () => {
  let component: CreateEditAlertComponent;
  let fixture: ComponentFixture<CreateEditAlertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditAlertComponent],
    });
    fixture = TestBed.createComponent(CreateEditAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
