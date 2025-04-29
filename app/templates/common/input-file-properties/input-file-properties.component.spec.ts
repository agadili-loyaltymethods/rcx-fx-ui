import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFilePropertiesComponent } from './input-file-properties.component';

describe('InputFilePropertiesComponent', () => {
  let component: InputFilePropertiesComponent;
  let fixture: ComponentFixture<InputFilePropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputFilePropertiesComponent],
    });
    fixture = TestBed.createComponent(InputFilePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
