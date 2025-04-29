import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputHeaderPropertiesComponent } from './input-header-properties.component';

describe('InputHeaderPropertiesComponent', () => {
  let component: InputHeaderPropertiesComponent;
  let fixture: ComponentFixture<InputHeaderPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputHeaderPropertiesComponent],
    });
    fixture = TestBed.createComponent(InputHeaderPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
