import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditDependencyComponent } from './create-edit-dependency.component';

describe('CreateEditDependencyComponent', () => {
  let component: CreateEditDependencyComponent;
  let fixture: ComponentFixture<CreateEditDependencyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditDependencyComponent],
    });
    fixture = TestBed.createComponent(CreateEditDependencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
