import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './../../app.material.module';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './../../shared/layout/header/header.component';
import { AccountComponent } from './account.component';
import { ChangePasswordComponent } from './../../core/change-password/change-password.component';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FlexLayoutModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
      ],
      declarations: [
        ChangePasswordComponent,
        HeaderComponent,
        AccountComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
