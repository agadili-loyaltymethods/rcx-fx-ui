import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsePropertiesComponent } from './response-properties.component';

describe('ResponsePropertiesComponent', () => {
  let component: ResponsePropertiesComponent;
  let fixture: ComponentFixture<ResponsePropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResponsePropertiesComponent],
    });
    fixture = TestBed.createComponent(ResponsePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
