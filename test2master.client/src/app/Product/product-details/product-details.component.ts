import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../Models/product.module';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-details',
  standalone: false,
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  product: Product | undefined;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService // ضفناها هون

  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.loadProduct(+productId);
      } else {
        this.router.navigate(['/shop']);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe(
      (product) => {
        if (product) {
          this.product = product;
        } else {
          this.error = 'لم يتم العثور على المنتج';
        }
        this.loading = false;
      },
      (error) => {
        this.error = 'حدث خطأ أثناء تحميل تفاصيل المنتج';
        this.loading = false;
        console.error('Error loading product:', error);
      }
    );
  }

  //addToCart(): void {
  //  // This would connect to a cart service in a real application
  //  alert('تمت إضافة المنتج إلى سلة التسوق');
  //}

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, 1); // كمية واحدة كبداية
      //alert('✅ تم إضافة المنتج إلى سلة التسوق');
      Swal.fire({
        html: `
        <div class="cart-animation">
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-cart3" viewBox="0 0 16 16">
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
          </svg>
        </div>
        <p>✅ تم إضافة المنتج إلى سلة التسوق</p>
      `,
        showConfirmButton: false,
        timer: 1500,
        didOpen: () => {
          // Add animation here to scale the SVG up, like a bouncing effect.
          const cartElement = document.querySelector('.cart-animation svg') as HTMLElement;
          cartElement.classList.add('animate-cart');
        }
      });
    }
  }
}
