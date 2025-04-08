import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth/auth.service';

export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

canActivate(route: ActivatedRouteSnapshot): boolean {
  const expectedRole = route.data['role'];
  const userRole = this.authService.getUserRole();

  if (userRole !== expectedRole) {
    this.router.navigate(['/unauthorized']);
    return false;
  }
  return true;
}
}
