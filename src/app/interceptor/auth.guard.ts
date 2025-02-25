import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {authInterceptor} from './auth.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  //constructor(private router: Router) {}
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    /*const expectedRole = route.data['role'];  // Get required role from route
    const userRole = AuthUtils.getUserRole();

    if (userRole && userRole === expectedRole) {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);  // Redirect unauthorized users
      return false;
    }*/
    console.log('AuthGuard:'+this.authService.isLoggedIn())
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
