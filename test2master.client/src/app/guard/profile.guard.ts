import { CanActivate, , Router } from '@angular/router';

export class profileGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'Buyer') return true;

    this.router.navigate(['/login']);
    return false;
  }
}
