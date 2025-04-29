import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalTableSearchComponent } from './global-table-search.component';

describe('GlobalTableSearchComponent', () => {
  let component: GlobalTableSearchComponent;
  let fixture: ComponentFixture<GlobalTableSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GlobalTableSearchComponent],
    });
    fixture = TestBed.createComponent(GlobalTableSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
