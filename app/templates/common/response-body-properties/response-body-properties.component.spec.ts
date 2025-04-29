import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseBodyPropertiesComponent } from './response-body-properties.component';

describe('ResponseBodyPropertiesComponent', () => {
  let component: ResponseBodyPropertiesComponent;
  let fixture: ComponentFixture<ResponseBodyPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResponseBodyPropertiesComponent],
    });
    fixture = TestBed.createComponent(ResponseBodyPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
