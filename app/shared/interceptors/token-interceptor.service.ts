import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader.service';

import { catchError, finalize } from 'rxjs/operators';
import { AlertService } from '../services/alert.service';

export class RcxError {
  httpStatusCode: number;
  httpStatusText: string;
  url: string;
  errorMessage: string;
  errorCode: number;
  name: string;
  message: string;
  code: number;
  description: string;
  data: any;
  status: any;
  errors: any;
}
@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  private _pendingRequests = 0;

  constructor(
    private auth: AuthService,
    private loaderService: LoaderService,
    private alertService: AlertService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    this._pendingRequests++;
    if (1 === this._pendingRequests) {
      this.loaderService.setIsLoading(true);
    }
    const authToken = this.auth.getToken();
    const authReq = request.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` },
      setParams: {
        locale: 'en',
        offset: `${-new Date().getTimezoneOffset()}`,
      },
    });

    return next.handle(authReq).pipe(
      catchError((httpError: any) => {
        if (
          httpError.error &&
          (httpError.error.code === 1005 ||
            httpError.error.code === 1008 ||
            httpError.error.code === 1009 ||
            httpError.error.code === 1010)
        ) {
          this.alertService.errorAlert(httpError.error.message);
          this.auth.logoutUser();
        }
        const error: RcxError = new RcxError();

        if (httpError instanceof HttpResponse) {
          error.httpStatusCode = httpError.status;
          error.httpStatusText = httpError.statusText;
          error.url = httpError.url;
          const body: RcxError[] = JSON.parse(httpError.body);

          if (body && body[0]) {
            error.errorMessage = body[0].message;
            error.errorCode = body[0].code;
            if (body[0].code === 1504) {
              error.errors = body[0].errors;
            }
          }
        } else if (httpError instanceof HttpErrorResponse) {
          error.httpStatusCode = httpError.status;
          error.httpStatusText = httpError.statusText;
          error.url = httpError.url;
          const body: RcxError | RcxError[] = httpError.error;

          if (body) {
            if (Array.isArray(body)) {
              error.errorMessage = body[0].message;
              error.errorCode = body[0].code;
              if (body[0].code === 1504) {
                error.errors = body[0].errors;
              }
            } else {
              error.errorMessage =
                body.message ||
                (body.errors && body.errors[0] && body.errors[0].message);
              error.errorCode =
                body.code ||
                (body.errors && body.errors[0] && body.errors[0].code);
              error.errors = body.errors;
            }
          }
          if (error.httpStatusCode === 0) {
            error.errorMessage =
              'Network error: Looks like you have' +
              ' an unstable network at the moment, please try again when network stabilizes';
            error.errorCode = 0;
          }
        } else {
          error.errorMessage = httpError.message
            ? httpError.message
            : httpError.toString();
        }

        return throwError(error);
      }),
      finalize(() => {
        this._pendingRequests--;
        const lastAPIAccess = new Date(new Date().getTime()).toISOString();

        sessionStorage.setItem('lastAPIAccess', lastAPIAccess);
        if (0 === this._pendingRequests) {
          this.loaderService.setIsLoading(false);
        }
      }),
    );
  }
}
