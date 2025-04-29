import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginModel } from '../models/login.model';
import { Service } from './service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  REST_URL = environment.REST_URL;
  baseUrl = this.REST_URL + '/api/';
  private user: any = {};
  private oktaEnabled = 'false';
  private orgName = '';
  private _serverInfo: any = undefined;
  orgPublisher = new BehaviorSubject(this.orgName);
  oktaStatusPublisher = new BehaviorSubject(this.oktaEnabled);
  serverInfoPublisher = new BehaviorSubject(this._serverInfo);
  userPermissions = new BehaviorSubject({});
  pathPermissionMap = {
    integrations: {
      list: { FX_Integration: ['read'] },
      create: { FX_Integration: ['create'] },
      edit: { FX_Integration: ['update'] },
      detail: { FX_Integration: ['read'] },
    },
    connections: {
      list: { FX_Connection: ['read'] },
      create: { FX_Connection: ['create'] },
      edit: { FX_Connection: ['update'] },
      detail: { FX_Connection: ['read'] },
    },
    templates: {
      list: { FX_IntegrationTemplate: ['read'] },
      create: { FX_IntegrationTemplate: ['create'] },
      edit: { FX_IntegrationTemplate: ['update'] },
      detail: { FX_IntegrationTemplate: ['read'] },
    },
    partners: {
      list: { FX_Partner: ['read'] },
      create: { FX_Partner: ['create'] },
      edit: { FX_Partner: ['update'] },
      detail: { FX_Partner: ['read'] },
    },
    runhistory: {
      list: { FX_RunHistory: ['read'] },
    },
    users: {
      create: { User: ['create'] },
      edit: { User: ['update'] },
      detail: { User: ['read'] },
    },
  };

  permissions: any = {
    userPermissions: {},
  };

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private service: Service,
  ) {}

  loginUser(user: LoginModel): Observable<LoginModel> {
    return this.httpClient
      .post<LoginModel>(`${this.REST_URL}/login`, user)
      .pipe(map((user) => user));
  }

  async fetchUserPermissions() {
    this.permissions = this.permissions || { userPermissions: {} };
    try {
      this.permissions.userPermissions = await firstValueFrom(
        this.service.getLoggedUserPermissions(),
      );
      this.userPermissions.next(this.permissions?.userPermissions?.permissions);
    } catch (err) {
      if (err?.errorCode === 1104) {
        this.logoutUser();
      }
    }
  }

  async setUser(): Promise<any> {
    const url = this.baseUrl + 'myaccount';
    const user = await firstValueFrom(
      this.httpClient.get<any>(url).pipe(map((result) => result)),
    );

    this.user = user || {};
    const userDetails = {
      login: this.user.login,
      email: this.user.email,
    };

    this.user.userProfile = userDetails;
  }

  async getUser(field?: string): Promise<any> {
    if (!Object.keys(this.user)?.length) {
      await this.setUser();
    }

    return field ? this.user[field] : this.user;
  }

  isLoggedIn(): boolean {
    // TODO
    // Implementing server side validation is ideal
    const loggedIn = !!sessionStorage.getItem('token');
    const orgName = sessionStorage.getItem('org') || '';
    const oktaEnabled = sessionStorage.getItem('oktaEnabled') || '';

    if (loggedIn) {
      if (this.oktaEnabled !== oktaEnabled) {
        this.oktaEnabled = oktaEnabled;
        this.oktaStatusPublisher.next(this.oktaEnabled);
      }
      if (this.orgName !== orgName) {
        this.orgName = orgName;
        this.orgPublisher.next(this.orgName);
      }
    }

    return loggedIn;
  }

  logoutUser() {
    if (!this.isLoggedIn()) {
      sessionStorage.removeItem('token');
      this.goToLogin({});

      return;
    }
    this.user = undefined;
    if (sessionStorage.getItem('oktaEnabled') === 'true') {
      sessionStorage.removeItem('RCX_username');
      sessionStorage.removeItem('org');
      sessionStorage.removeItem('userLimits');
      sessionStorage.removeItem('idtoken');
    } else {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('org');
    }

    return this.httpClient.get<any>(`${this.baseUrl}logout`).subscribe(
      (response) => {
        sessionStorage.removeItem('token');
        this.goToLogin(response);
      },
      () => {
        sessionStorage.removeItem('token');
        this.goToLogin({});
      },
    );
  }

  goToLogin(response: any): void {
    if (response && response.postLogoutRedirect) {
      this.router.navigate(['/logout']);
    } else {
      if (sessionStorage.oktaEnabled) {
        window.location.replace('/int-login');
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  getToken(): string {
    return sessionStorage.getItem('token');
  }

  async fetchServerInfo(): Promise<any> {
    const url = this.REST_URL + `/serverinfo`;  
    return firstValueFrom(
      this.httpClient.get<any>(url).pipe(
        map((data) => {
          this._serverInfo = data;
          this.serverInfoPublisher.next(this._serverInfo);
          return this._serverInfo;
        })
      )
    );
  }

  async getServerInfo() {
    if(!this._serverInfo) {
      await this.fetchServerInfo();
    }
    return this._serverInfo;
  }

  resetPassword(params: any): Observable<any> {
    const url = this.REST_URL + '/reset-password?client=fxui';

    return this.httpClient.post<any>(url, params).pipe(map((user) => user));
  }

  sendUserId(params: any): Observable<any> {
    const url = this.REST_URL + '/send-userid?locale=en';

    return this.httpClient.post<any>(url, params).pipe(map((user) => user));
  }
}
