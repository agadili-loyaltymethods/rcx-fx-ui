import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/app.material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

fdescribe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

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
      declarations: [ResetPasswordComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create reset-password component', () => {
    expect(component).toBeTruthy();
  });

  it('should not accept password when it does not qualify 3 password policies', () => {
    component.resetForm.controls['newPassword'].setValue('hello1pwd');
    const newPassword: any = component.resetForm.controls['newPassword'].value;

    expect(component.passwordPolicies(newPassword, 3)).toEqual(false);
  });

  it('should accept password when it qualifies atleast 3 of password policies', () => {
    component.resetForm.controls['newPassword'].setValue('Hello1pwd@');
    const newPassword: any = component.resetForm.controls['newPassword'].value;

    expect(component.passwordPolicies(newPassword, 3)).toEqual(true);
  });

  it('should show error message when the new password and confirm password does not match', async () => {
    component.resetForm.controls['newPassword'].setValue('Hello1pwd@');
    component.resetForm.controls['confirmPassword'].setValue('Hello1pwd');
    await component.onPasswordSubmit();
    expect(component.errorMessage).toEqual('The two passwords do not match');
  });

  it('should show error message when the password does not match password policies', async () => {
    component.resetForm.controls['newPassword'].setValue('hello1pwd');
    component.resetForm.controls['confirmPassword'].setValue('hello1pwd');
    await component.onPasswordSubmit();
    expect(component.errorMessage).toEqual(
      'Invalid password' +
        '<br>' +
        'Your password must be at least nine (9) characters long and ' +
        'contain some combination of at least three (3) of the following classes of characters:' +
        '<ul style="margin-left: 20px;"><li>' +
        'lowercase' +
        '</li><li>' +
        'uppercase' +
        '</li><li>' +
        'numeric' +
        '</li><li>' +
        'special (e.g. $, %, ^, *, [, ], {, }, etc.,)' +
        '</li></ul>',
    );
  });

  it('should show success message when the password changed successfully', async () => {
    component.resetForm.controls['newPassword'].setValue('Hello1pwd@');
    component.resetForm.controls['confirmPassword'].setValue('Hello1pwd@');
    spyOn(component.authService, 'resetPassword').and.returnValue(
      of({ message: 'Password has been changed successfully.' }),
    );
    await component.onPasswordSubmit();
    expect(component.authService.resetPassword).toHaveBeenCalled();
    expect(component.infoMessage).toEqual(
      'Password has been changed successfully.',
    );
  });

  it('should show error message when there is error while changing password', async () => {
    component.resetForm.controls['newPassword'].setValue('Hello1pwd@');
    component.resetForm.controls['confirmPassword'].setValue('Hello1pwd@');
    spyOn(component.authService, 'resetPassword').and.throwError('Failed');
    spyOn(component.alertService, 'errorAlert');
    await component.onPasswordSubmit();
    expect(component.authService.resetPassword).toHaveBeenCalled();
    expect(component.authService.resetPassword).toThrowError();
    expect(component.errorMessage).toEqual('Failed to Reset Password!');
    expect(component.alertService.errorAlert).toHaveBeenCalled();
  });

  it('should show invalid token error message when the token is null', async () => {
    component.resetForm.controls['newPassword'].setValue('Hello1pwd@');
    component.resetForm.controls['confirmPassword'].setValue('Hello1pwd@');
    component.token = null;
    await component.onPasswordSubmit();
    expect(component.errorMessage).toEqual('Invalid token');
  });

  it('should clear errorMessage when resetForm valuee gets changed', async () => {
    component.errorMessage = 'Error Message';
    component.resetForm.controls['newPassword'].setValue('Hello1pwd@');
    expect(component.errorMessage).toEqual('');
  });
});
