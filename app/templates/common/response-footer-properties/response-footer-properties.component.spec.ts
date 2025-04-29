import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseFooterPropertiesComponent } from './response-footer-properties.component';

describe('ResponseFooterPropertiesComponent', () => {
  let component: ResponseFooterPropertiesComponent;
  let fixture: ComponentFixture<ResponseFooterPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResponseFooterPropertiesComponent],
    });
    fixture = TestBed.createComponent(ResponseFooterPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
