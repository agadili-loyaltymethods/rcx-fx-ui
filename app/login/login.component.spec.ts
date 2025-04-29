import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './../../app.material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginComponent } from './login.component';
import { of } from 'rxjs';

fdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // setting up
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule,
      ],
      declarations: [LoginComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should show login form default', () => {
    expect(component).toBeTruthy();
    expect(component.showForm).toEqual('Login');
  });

  it('should show forgot password form when forgot password is clicked', () => {
    component.forgotPassword();
    expect(component.showForm).toEqual('ForgotPassword');
  });

  it('should show forgot user form when forgot user is clicked', () => {
    component.forgotUser();
    expect(component.showForm).toEqual('ForgotUser');
  });

  it('should show error when user email is not valid', async () => {
    component.forgotUser();
    component.forgotUserForm.controls['email'].setValue('manojgmia.com');
    await component.getUserId();
    expect(component.errorMessage).toEqual('Invalid email address');
  });

  it('should getuserid succeed when submitted with valid email', async () => {
    component.forgotUser();
    spyOn(component.authService, 'sendUserId').and.returnValue(
      of({ message: 'Success' }),
    );
    component.forgotUserForm.controls['email'].setValue('manoj@gmia.com');
    await component.getUserId();
    expect(component.infoMessage).toEqual('Success');
  });

  it('should getuserid set infoMessage to default message when reponse has no message field', async () => {
    component.forgotUser();
    spyOn(component.authService, 'sendUserId').and.returnValue(
      of({ n: 'Success' }),
    );
    component.forgotUserForm.controls['email'].setValue('manoj@gmia.com');
    await component.getUserId();
    expect(component.infoMessage).toEqual(
      'If the email you entered was a valid one, you should receive an email with further instructions.',
    );
  });

  it('should show proper errormessage when getuserid is failed', async () => {
    component.forgotUser();
    spyOn(component.authService, 'sendUserId').and.throwError('Some error');
    spyOn(component.alertService, 'errorAlert');

    component.forgotUserForm = component.formBuilder.group({
      email: ['manoj@gmail.com'],
    });
    await component.getUserId();
    expect(component.errorMessage).toEqual(
      'Something went wrong. Please try again later.',
    );
    expect(component.alertService.errorAlert).toHaveBeenCalled();
  });

  it('should get password reset email when valid userId is provided to forgot password form', async () => {
    component.forgotPassword();
    spyOn(component.authService, 'resetPassword').and.returnValue(
      of({ message: 'Success' }),
    );
    component.forgotPasswordForm.controls['userID'].setValue('manoj@gmia.com');
    await component.resetPassword();
    expect(component.infoMessage).toEqual('Success');
  });

  it('should show info message when userId is submitted', async () => {
    component.forgotPassword();
    spyOn(component.authService, 'resetPassword').and.returnValue(
      of({ n: 'Success' }),
    );
    component.forgotPasswordForm.controls['userID'].setValue('manojgmia.com');
    await component.resetPassword();
    expect(component.infoMessage).toEqual(
      'If the user you entered was a valid one, you should receive an email with further instructions.',
    );
  });

  it('should show error message when forgotuser is failed', async () => {
    component.forgotPassword();
    spyOn(component.authService, 'resetPassword').and.throwError('Some error');
    spyOn(component.alertService, 'errorAlert');
    component.forgotPasswordForm.controls['userID'].setValue('manoj');
    await component.resetPassword();
    expect(component.errorMessage).toEqual(
      'Something went wrong. Please try again later.',
    );
    expect(component.alertService.errorAlert).toHaveBeenCalled();
  });

  it('should setUser, getUserPermissions and loadLimits when user successfully loggedin', async () => {
    component.ngOnInit();
    spyOn(component.authService, 'loginUser').and.returnValue(
      of({
        token: 'Success',
        username: '',
        password: '',
        locale: '',
      }),
    );
    spyOn(component.authService, 'setUser').and.returnValue(null);
    spyOn(component.limitService, 'loadLimits').and.returnValue(
      Promise.resolve(),
    );
    spyOn(component.router, 'navigate').and.returnValue(null);
    spyOn(component.memberAccountService, 'getUserPermissions').and.returnValue(
      Promise.resolve({ MCPUI: { read: true } }),
    );
    component.loginForm.controls['username'].setValue('manojgmia.com');
    component.loginForm.controls['password'].setValue('manojgmia.com');
    await component.onLoginSubmit();
    expect(component.errorMessage).toBeNull();
    expect(component.authService.setUser).toHaveBeenCalled();
    expect(component.limitService.loadLimits).toHaveBeenCalled();
    expect(
      component.memberAccountService.getUserPermissions,
    ).toHaveBeenCalled();
  });

  it('should show error message when login is failed', async () => {
    component.ngOnInit();
    spyOn(component.authService, 'loginUser').and.throwError('Some error');
    component.loginForm.controls['username'].setValue('manojgmia.com');
    component.loginForm.controls['password'].setValue('manojgmia.com');
    await component.onLoginSubmit();
    expect(component.errorMessage).toEqual('Failed to login, please try again');
  });
});
