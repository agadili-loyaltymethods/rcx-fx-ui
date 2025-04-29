import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatePropertiesComponent } from './template-properties.component';

describe('TemplatePropertiesComponent', () => {
  let component: TemplatePropertiesComponent;
  let fixture: ComponentFixture<TemplatePropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TemplatePropertiesComponent],
    });
    fixture = TestBed.createComponent(TemplatePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
