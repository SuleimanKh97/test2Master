import { Component, OnInit, HostListener, ElementRef, Renderer2, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../Services/cart/cart.service';
import { AuthService } from '../../Services/auth/auth.service';
import { Router } from '@angular/router';
import { CartItem } from '../../Interfaces/cart.interface';

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
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('navbarToggler') navbarToggler!: ElementRef;
  @ViewChild('navbarNav') navbarNav!: ElementRef;

  cartCount$!: Observable<number>;
  cartItems$: Observable<CartItem[]>;
  cartTotal$: Observable<number>;
  isLoggedIn = false;
  currentUser: any = null;
  private authSubscription: Subscription | null = null;
  private documentClickListener: (() => void) | null = null;

  isCartPreviewVisible = false;
  private cartPreviewTimeout: any = null;

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.cartItems$ = this.cartService.getCartItems();
    this.cartTotal$ = this.cartService.getCartTotal();
  }

  hovering: boolean = false;

  ngOnInit() {
    this.cartCount$ = this.cartService.getCartCount();
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
    this.checkScroll();
  }

  ngAfterViewInit(): void {
    this.addDocumentClickListener();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.removeDocumentClickListener();
    if (this.cartPreviewTimeout) {
      clearTimeout(this.cartPreviewTimeout);
    }
  }

  showCartPreview(): void {
    if (this.cartPreviewTimeout) {
      clearTimeout(this.cartPreviewTimeout);
      this.cartPreviewTimeout = null;
    }
    this.isCartPreviewVisible = true;
  }

  hideCartPreview(): void {
    this.cartPreviewTimeout = setTimeout(() => {
      this.isCartPreviewVisible = false;
    }, 300);
  }

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const headerElement = this.elementRef.nativeElement.querySelector('header');
    if (headerElement) {
      if (scrollPosition > 50) { this.renderer.addClass(headerElement, 'scrolled'); }
      else { this.renderer.removeClass(headerElement, 'scrolled'); }
    }
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeNavbar();
  }

  private addDocumentClickListener(): void {
    this.documentClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (!this.navbarToggler || !this.navbarNav || !this.navbarNav.nativeElement) { return; }
      const clickedInsideToggler = this.navbarToggler.nativeElement.contains(event.target as Node);
      const clickedInsideNavbar = this.navbarNav.nativeElement.contains(event.target as Node);
      const isNavbarOpen = this.navbarNav.nativeElement.classList.contains('show');
      if (isNavbarOpen && !clickedInsideToggler && !clickedInsideNavbar) {
        this.closeNavbar();
      }
    });
  }

  private removeDocumentClickListener(): void {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }

  private closeNavbar(): void {
    if (this.navbarToggler?.nativeElement && this.navbarNav?.nativeElement.classList.contains('show')) {
      this.navbarToggler.nativeElement.click();
    }
  }
}
