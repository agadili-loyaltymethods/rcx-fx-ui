import { Injectable } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean> | Observable<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard
  implements CanDeactivate<CanComponentDeactivate> {
  constructor(
    private router: Router, // Import the Router
  ) {}

  canDeactivate(
    component: CanComponentDeactivate,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const navigation = this.router.getCurrentNavigation();
    const finalUrl = navigation?.finalUrl?.toString() || '';

    if (finalUrl === '/login' || finalUrl === '/logout') {
      return true;
    }
    const disableGuard =
      navigation.extras?.state?.disableDeactivateGuard || false;

    if (disableGuard) {
      return true;
    } else {
      history.pushState(null, null, location.href);
      return component.canDeactivate ? component.canDeactivate() : true;
    }
  }
}
