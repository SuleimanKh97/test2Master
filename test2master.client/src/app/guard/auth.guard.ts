//import { CanActivateFn } from '@angular/router';
//import { Injectable } from '@angular/core';
//import { CanActivate, Router } from '@angular/router';
//import { AuthService } from '../Services/auth/auth.service';

//export class AuthGuard implements CanActivate {
//  constructor(private authService: AuthService, private router: Router) { }

//  canActivate(): boolean {
//    if (!this.authService.isAuthenticated()) {
//      this.router.navigate(['/login']);
//      return false;
//    }
//    return true;
//  }
//}
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
// No need for jwt-decode anymore

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Running canActivate...');

    // Use the isAuthenticated method from the provided service
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: Not authenticated, redirecting to login.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // --- Role Check --- 
    const requiredRoles = route.data['roles'] as Array<string>;
    if (!requiredRoles || requiredRoles.length === 0) {
      // If no roles are required for the route, allow access since user is authenticated
      console.log('AuthGuard: No specific roles required, allowing access.');
      return true;
    }

    // Get user role from the provided service
    const userRole = this.authService.getUserRole()?.toLowerCase(); // Use optional chaining and lowercase
    console.log('AuthGuard: User role:', userRole, 'Required roles:', requiredRoles);

    if (!userRole || !requiredRoles.some(required => required.toLowerCase() === userRole)) {
      // User does not have any of the required roles
      console.log('AuthGuard: Role check failed, redirecting.');
      // Optional: Redirect to an unauthorized page or home
      this.router.navigate(['/']);
      return false;
    }
    // ------------------

    console.log('AuthGuard: Role check passed, allowing access.');
    return true; // User is authenticated and has the required role
  }
}
