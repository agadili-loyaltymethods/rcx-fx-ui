import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIntegrationComponent } from './edit-integration.component';

describe('EditIntegrationComponent', () => {
  let component: EditIntegrationComponent;
  let fixture: ComponentFixture<EditIntegrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditIntegrationComponent],
    });
    fixture = TestBed.createComponent(EditIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
