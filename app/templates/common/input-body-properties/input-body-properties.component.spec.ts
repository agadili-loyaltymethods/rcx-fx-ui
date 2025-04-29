import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputBodyPropertiesComponent } from './input-body-properties.component';

describe('InputBodyPropertiesComponent', () => {
  let component: InputBodyPropertiesComponent;
  let fixture: ComponentFixture<InputBodyPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputBodyPropertiesComponent],
    });
    fixture = TestBed.createComponent(InputBodyPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
