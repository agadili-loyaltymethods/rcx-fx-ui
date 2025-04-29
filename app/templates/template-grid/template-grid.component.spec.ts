import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateGridComponent } from './template-grid.component';

describe('TemplateGridComponent', () => {
  let component: TemplateGridComponent;
  let fixture: ComponentFixture<TemplateGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateGridComponent],
    });
    fixture = TestBed.createComponent(TemplateGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
