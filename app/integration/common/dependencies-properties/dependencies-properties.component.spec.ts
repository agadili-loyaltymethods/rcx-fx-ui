import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependenciesPropertiesComponent } from './dependencies-properties.component';

describe('DependenciesPropertiesComponent', () => {
  let component: DependenciesPropertiesComponent;
  let fixture: ComponentFixture<DependenciesPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DependenciesPropertiesComponent],
    });
    fixture = TestBed.createComponent(DependenciesPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
