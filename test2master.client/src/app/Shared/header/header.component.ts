import { Component, OnInit, HostListener, ElementRef, Renderer2, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CartItem } from '../../interfaces/cart.interface';

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

  // For dropdown menus
  productsDropdownOpen = false;
  resourcesDropdownOpen = false;

  // مُتغير لحالة البرغر منيو
  isMobileMenuOpen = false;

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

  // دالة للتبديل بين فتح وإغلاق القائمة للهواتف المحمولة
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    // إضافة أو إزالة صنف menu-open على الجسم للتظليل
    if (this.isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  // إغلاق القائمة عند النقر على رابط في القائمة المحمولة
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.classList.remove('menu-open');
  }

  toggleProductsDropdown(): void {
    this.productsDropdownOpen = !this.productsDropdownOpen;
    if (this.productsDropdownOpen) {
      this.resourcesDropdownOpen = false;
    }
  }

  toggleResourcesDropdown(): void {
    this.resourcesDropdownOpen = !this.resourcesDropdownOpen;
    if (this.resourcesDropdownOpen) {
      this.productsDropdownOpen = false;
    }
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
    this.closeMobileMenu();
  }

  private addDocumentClickListener(): void {
    this.documentClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      // Close mobile menu when clicking outside
      if (this.isMobileMenuOpen) {
        const mobileMenuElement = this.elementRef.nativeElement.querySelector('.mobile-menu-overlay');
        const hamburgerButton = this.elementRef.nativeElement.querySelector('.sidebar-toggle');

        if (mobileMenuElement && !mobileMenuElement.contains(event.target) &&
          hamburgerButton && !hamburgerButton.contains(event.target)) {
          this.closeMobileMenu();
        }
      }

      // Close dropdowns when clicking outside
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.productsDropdownOpen = false;
        this.resourcesDropdownOpen = false;
      }

      // Original navbar mobile menu handling
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
