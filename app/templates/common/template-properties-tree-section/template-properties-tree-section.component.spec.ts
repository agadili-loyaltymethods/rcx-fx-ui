import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatePropertiesTreeSectionComponent } from './template-properties-tree-section.component';

describe('TemplatePropertiesTreeSectionComponent', () => {
  let component: TemplatePropertiesTreeSectionComponent;
  let fixture: ComponentFixture<TemplatePropertiesTreeSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TemplatePropertiesTreeSectionComponent],
    });
    fixture = TestBed.createComponent(TemplatePropertiesTreeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
