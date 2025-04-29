import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { sharedConstants } from '../shared';
import { LoginModel } from '../shared/models/login.model';
import { AlertService } from '../shared/services/alert.service';
import { AuthService } from '../shared/services/auth.service';
import { UtilsService } from '../shared/services/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  hidePasswordIcon = true;
  loginUserData = {};
  user: LoginModel = new LoginModel();
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  forgotUserForm: FormGroup;
  errorMessage: string = null;
  infoMessage: string = null;
  showForm = 'Login';
  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public router: Router,
    private alertService: AlertService,
    private utilService: UtilsService,
  ) {}

  async ngOnInit() {
    if (this.isLoggedIn()) {
      const perms = this.utilService.checkPerms({ FX_UI: ['read'] });
      if (perms)
        this.router.navigate(['/dashboard']);
    }
    this.goToLogin();
  }

  async onLoginSubmit() {
    this.user.username = this.loginForm.controls['username'].value;
    this.user.password = this.loginForm.controls['password'].value;
    // Todo should be based on lang distrubution
    this.user.locale = 'en';
    try {
      const response: any = await firstValueFrom(
        this.authService.loginUser(this.user),
      );

      if (response) {
        let org = this.user.username.split('/')[0];

        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', this.user.username.toString());
        sessionStorage.setItem('org', org);
        await this.authService.fetchUserPermissions();
        const perms = this.utilService.checkPerms({ FX_UI: ['read'] });
        if (!perms) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('org');
          org = '';
          this.errorMessage =
            'You do not have access to Feedxchange Portal UI.' +
            ' Please contact your system adminstrator for further support';
          this.alertService.errorAlert(this.errorMessage);
        } else {
          this.errorMessage = null;
          await this.authService.setUser();
          this.router.navigate(['/dashboard']);
        }
        this.authService.orgPublisher.next(org);
      }
    } catch (e) {
      this.errorMessage = e.errorMessage || 'Failed to login, please try again';
      this.alertService.errorAlert(this.errorMessage);
    }
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  forgotPassword() {
    this.forgotPasswordForm = this.formBuilder.group({
      userID: ['', Validators.required],
    });
    this.clearMessages();
    this.showForm = 'ForgotPassword';
  }

  forgotUser() {
    this.forgotUserForm = this.formBuilder.group({
      email: ['', Validators.required],
    });
    this.clearMessages();
    this.showForm = 'ForgotUser';
  }

  clearMessages() {
    this.infoMessage = '';
    this.errorMessage = '';
  }

  goToLogin() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.clearMessages();
    this.showForm = 'Login';
  }

  async resetPassword() {
    this.clearMessages();
    const userID = this.forgotPasswordForm.controls['userID'].value;

    const params = {
      userID,
      client: 'fxui',
    };

    try {
      const response = await this.authService.resetPassword(params).toPromise();

      this.infoMessage =
        response.message ||
        'If the user you entered was a valid one, ' +
          'you should receive an email with further instructions.';
    } catch (error) {
      this.errorMessage =
        error.errorMessage || sharedConstants.defaultErrorMessage;
      this.alertService.errorAlert(this.errorMessage);
    }
  }

  async getUserId() {
    this.clearMessages();
    const email = this.forgotUserForm.controls['email'].value;
    const regex =
      /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (!regex.test(email)) {
      this.errorMessage = 'Invalid email address';

      return;
    }
    const params = {
      email,
      client: 'fxui',
      locale: 'en',
    };

    try {
      const response = await this.authService.sendUserId(params).toPromise();

      this.infoMessage =
        response.message ||
        'If the email you entered was a valid one, ' +
          'you should receive an email with further instructions.';
    } catch (error) {
      this.errorMessage =
        error.errorMessage || sharedConstants.defaultErrorMessage;
      // this.alertService.errorAlert(this.errorMessage);
    }
  }
}
