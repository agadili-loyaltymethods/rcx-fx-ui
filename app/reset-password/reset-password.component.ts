import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  errorMessage: string;
  infoMessage: string;
  token: string;
  sub: any;
  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public alertService: AlertService,
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.resetForm = this.formBuilder.group(
      {
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: Validators.compose([this.newMatchesConfirm]),
      },
    );
    this.resetForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  newMatchesConfirm(group: FormGroup) {
    const confirm = group.controls['confirmPassword'];

    if (group.controls['newPassword'].value !== confirm.value)
      confirm.setErrors({ newMatchesConfirm: true });

    return null;
  }

  async onPasswordSubmit() {
    const newPassword = this.resetForm.controls['newPassword'].value;
    const confirmPassword = this.resetForm.controls['confirmPassword'].value;

    if (!this.passwordPolicies(newPassword, 3)) {
      this.errorMessage =
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
        'special (e.g. $, %, ^, *, [, ], {, }, etc.)' +
        '</li></ul>';

      return;
    }

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'The two passwords do not match';

      return;
    }

    if (this.token == null) {
      this.errorMessage = 'Invalid token';

      return;
    }

    const params = {
      password: newPassword,
      token: this.token,
    };

    try {
      const response: any = await firstValueFrom(
        this.authService.resetPassword(params),
      );

      if (response) {
        this.infoMessage = response.message;
      }
    } catch (error) {
      this.errorMessage = error.errorMessage || 'Failed to Reset Password!';
      this.alertService.errorAlert(this.errorMessage);
    }
  }

  passwordPolicies(password: string, atLeast: number) {
    const minLength = 9;
    const policies = [
      /[a-z]/g,
      /[A-Z]/g,
      /\d/g,
      /[@%+'.#^$(-/):-?{}-~!\\^_`\[\]]/g,
    ];
    let matchedTimes = 0;

    policies.forEach(function (e) {
      if (password.match(e)) {
        matchedTimes++;
      }
    });

    if (matchedTimes >= atLeast && password.length >= minLength) {
      return true;
    }

    return false;
  }
}
