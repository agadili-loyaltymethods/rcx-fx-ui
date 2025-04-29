import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerTableComponent } from './partner-table.component';

describe('PartnerTableComponent', () => {
  let component: PartnerTableComponent;
  let fixture: ComponentFixture<PartnerTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerTableComponent],
    });
    fixture = TestBed.createComponent(PartnerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
