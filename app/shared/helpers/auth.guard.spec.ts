import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { of } from 'rxjs';

fdescribe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [AuthGuard, { provide: Router, useClass: RouterStub }],
    });
  });

  it('should create AuthGuard', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('canActivate should return true when user is logged in', inject(
    [AuthGuard],
    (guard: AuthGuard) => {
      const isLoggedInSpy = spyOn(guard['authService'], 'isLoggedIn');

      isLoggedInSpy.and.returnValue(true);
      expect(guard.canActivate()).toBe(true);
    },
  ));

  it('canActivate should return false when user is not logged in and navigate to login page', inject(
    [AuthGuard],
    (guard: AuthGuard) => {
      spyOn(guard['router'], 'navigate');
      const isLoggedInSpy = spyOn(guard['authService'], 'isLoggedIn');

      isLoggedInSpy.and.returnValue(false);
      expect(guard.canActivate()).toBe(false);
      expect(guard['router'].navigate).toHaveBeenCalledWith(['/login']);
    },
  ));
});
class RouterStub {
  url = '';
  navigate(commands: any[], extras?: any) {}
}
