import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthorizationService } from '../shared/authorization.sevice';

@Injectable()
export class LoggedInGuard implements CanActivate {

  private readonly loginRoutes = ['/login', '/register', '/forgot-password'];

  constructor(private authorizationService: AuthorizationService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authorizationService.getAuth().map(auth => {
      const isLoginState = this.loginRoutes.indexOf(state.url) > -1;
      if (auth.uid && isLoginState) {
        this.router.navigateByUrl('/');
        return false;
      } else if (auth.uid || isLoginState) {
        return true;
      } else {
        this.router.navigateByUrl('/login');
        return false;
      }
    }).take(1);
  }
}
