import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownWithSearchComponent } from './drop-down-with-search.component';

describe('DropDownWithSearchComponent', () => {
  let component: DropDownWithSearchComponent;
  let fixture: ComponentFixture<DropDownWithSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DropDownWithSearchComponent],
    });
    fixture = TestBed.createComponent(DropDownWithSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
