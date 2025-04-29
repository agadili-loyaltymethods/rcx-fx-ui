import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationListComponent } from './integration-list.component';

describe('IntegrationListComponent', () => {
  let component: IntegrationListComponent;
  let fixture: ComponentFixture<IntegrationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegrationListComponent],
    });
    fixture = TestBed.createComponent(IntegrationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
