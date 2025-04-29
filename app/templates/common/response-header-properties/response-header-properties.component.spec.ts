import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseHeaderPropertiesComponent } from './response-header-properties.component';

describe('ResponseHeaderPropertiesComponent', () => {
  let component: ResponseHeaderPropertiesComponent;
  let fixture: ComponentFixture<ResponseHeaderPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResponseHeaderPropertiesComponent],
    });
    fixture = TestBed.createComponent(ResponseHeaderPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
