import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseFilePropertiesComponent } from './response-file-properties.component';

describe('ResponseFilePropertiesComponent', () => {
  let component: ResponseFilePropertiesComponent;
  let fixture: ComponentFixture<ResponseFilePropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResponseFilePropertiesComponent],
    });
    fixture = TestBed.createComponent(ResponseFilePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
