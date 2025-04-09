import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartService } from '../../Services/cart/cart.service';
import { AuthService } from '../../Services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  cartCount$!: Observable<number>;
  isLoggedIn = false;
  currentUser: any = null;
  constructor(private cartService: CartService, private authService: AuthService, private router: Router) { }
  hovering: boolean = false;

  ngOnInit() {
    this.cartCount$ = this.cartService.getCartCount();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
