import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFooterPropertiesComponent } from './input-footer-properties.component';

describe('InputFooterPropertiesComponent', () => {
  let component: InputFooterPropertiesComponent;
  let fixture: ComponentFixture<InputFooterPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputFooterPropertiesComponent],
    });
    fixture = TestBed.createComponent(InputFooterPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
