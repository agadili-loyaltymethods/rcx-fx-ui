import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTemplateComponent } from './view-template.component';

describe('ViewTemplateComponent', () => {
  let component: ViewTemplateComponent;
  let fixture: ComponentFixture<ViewTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewTemplateComponent],
    });
    fixture = TestBed.createComponent(ViewTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
