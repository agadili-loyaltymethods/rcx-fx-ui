import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root',
})
export class RouteGuard implements CanActivate {
  permSubscriber: any;
  permissions: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private utilsService: UtilsService,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    let path = route.routeConfig.path.split('/')[0];
    let parentPath =
      (route as any)._routerState?.url?.substring(1).split('/')[0] || '';
    const map = this.authService.pathPermissionMap;
    const hasUIPerm = await this.utilsService.isAllowed({ FX_UI: ['read'] });

    if (!hasUIPerm) {
      this.authService.logoutUser();

      return false;
    }
    if (parentPath === 'run-history') {
      parentPath = 'runhistory';
      path = 'list';
    }
    var id = (route as any)._routerState?.url?.substring(1).split('/')[2] || '';
    if (path === 'edit') {
      return this.utilsService.checkEdit(parentPath,id);
    }
    const permCheck =
      map[parentPath.toLowerCase()] && map[parentPath.toLowerCase()][path];

    if (permCheck) {
      const isAllowed = await this.utilsService.isAllowed(permCheck);

      if (!isAllowed && this.router.url.trim() === '/') {
        this.router.navigate(['/dashboard']);
      }

      return isAllowed;
    } else {
      return false;
    }
  }
}
