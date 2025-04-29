import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPropertiesComponent } from './input-properties.component';

describe('InputPropertiesComponent', () => {
  let component: InputPropertiesComponent;
  let fixture: ComponentFixture<InputPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputPropertiesComponent],
    });
    fixture = TestBed.createComponent(InputPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
