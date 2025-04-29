import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditErrorCodeMappingComponent } from './create-edit-error-code-mapping.component';

describe('CreateEditErrorCodeMappingComponent', () => {
  let component: CreateEditErrorCodeMappingComponent;
  let fixture: ComponentFixture<CreateEditErrorCodeMappingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditErrorCodeMappingComponent],
    });
    fixture = TestBed.createComponent(CreateEditErrorCodeMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
