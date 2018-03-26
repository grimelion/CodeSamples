import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthorizationService } from '../shared/authorization.sevice';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoggedInGuard implements CanActivate {

  private readonly loginRoutes = ['/login', '/register', '/forgot-password'];

  constructor(private authorizationService: AuthorizationService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authorizationService.getRoles().map(roles => {
      const isLoginState = this.loginRoutes.indexOf(state.url) > -1;
      const correctRole = roles['isRetoucher'] || roles['isModerator'] || roles['isAdmin'] || roles['isSuper'];
      if (correctRole && isLoginState) {
        this.router.navigateByUrl('/');
        return false;
      } else if (correctRole || isLoginState) {
        return true;
      } else {
        this.router.navigateByUrl('/login');
        return false;
      }
    }).take(1);
  }
}
