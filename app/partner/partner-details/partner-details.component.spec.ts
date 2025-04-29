import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerDetailsComponent } from './partner-details.component';

describe('PartnerDetailsComponent', () => {
  let component: PartnerDetailsComponent;
  let fixture: ComponentFixture<PartnerDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerDetailsComponent],
    });
    fixture = TestBed.createComponent(PartnerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
