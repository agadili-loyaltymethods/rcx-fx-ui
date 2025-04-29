import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorCodeMappingPropertiesComponent } from './error-code-mapping-properties.component';

describe('ErrorCodeMappingPropertiesComponent', () => {
  let component: ErrorCodeMappingPropertiesComponent;
  let fixture: ComponentFixture<ErrorCodeMappingPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorCodeMappingPropertiesComponent],
    });
    fixture = TestBed.createComponent(ErrorCodeMappingPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
