import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductDetailDTO } from '../services/product/product.service';
import { CartService } from '../services/cart/cart.service';
import { Product } from '../Models/product.module';
import { Observable, Subscription, EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Needed for async pipe, ngIf etc.

@Component({
    selector: 'app-product-detail',
    standalone: true, // Make it standalone
    imports: [
        CommonModule,
        // Add RouterLink if needed for navigation within the template
    ],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {

    product: ProductDetailDTO | null = null;
    isLoading = true;
    errorMessage: string | null = null;
    private productSubscription: Subscription | null = null;
    private cartSubscription: Subscription | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.productSubscription = this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    this.isLoading = true;
                    this.errorMessage = null;
                    return this.productService.getProductById(id).pipe(
                        catchError(err => {
                            console.error('Error fetching product details:', err);
                            this.errorMessage = err.message || 'Failed to load product details.';
                            this.isLoading = false;
                            if (err.status === 404) {
                                // Optionally redirect or show a specific "not found" message
                                this.router.navigate(['/not-found']); // Example redirect
                            }
                            return EMPTY; // Stop the observable chain on error
                        })
                    );
                } else {
                    this.errorMessage = 'Product ID not provided.';
                    this.isLoading = false;
                    this.router.navigate(['/shop']); // Redirect if no ID
                    return EMPTY;
                }
            })
        ).subscribe(productData => {
            this.product = productData;
            this.isLoading = false;
            console.log('Product details loaded:', this.product);
        });
    }

    ngOnDestroy(): void {
        this.productSubscription?.unsubscribe();
        this.cartSubscription?.unsubscribe();
    }

    addToCart(): void {
        if (!this.product) return;

        this.errorMessage = null; // Clear previous errors
        console.log('Adding product from detail page:', this.product.id);

        // Construct the Product object needed by CartService
        const productToAdd: Product = {
            id: this.product.id,
            name: this.product.name,
            description: this.product.description,
            price: this.product.price,
            imageUrl: this.product.img, // Match Product model property
            originalPrice: this.product.price, // Default if needed
            category: this.product.categoryName // Use category name from detail DTO
        };

        this.cartSubscription = this.cartService.addToCart(productToAdd).subscribe({
            next: () => {
                console.log('Successfully added to cart from detail page');
                alert(`تمت إضافة '${this.product?.name}' إلى السلة بنجاح!`);
                // Optionally navigate to cart or stay here
                // this.router.navigate(['/cart']); 
            },
            error: (err) => {
                console.error('Error adding item from detail page:', err);
                this.errorMessage = err.message || 'فشل في إضافة المنتج للسلة.';
                alert(`خطأ: ${this.errorMessage}`);
            }
        });
    }

    buyNow(): void {
        if (!this.product) return;

        this.errorMessage = null; // Clear previous errors
        console.log('Buying now from detail page:', this.product.id);

        // Construct the Product object needed by CartService
        const productToAdd: Product = {
            id: this.product.id,
            name: this.product.name,
            description: this.product.description,
            price: this.product.price,
            imageUrl: this.product.img,
            originalPrice: this.product.price,
            category: this.product.categoryName
        };

        // Subscribe to add to cart, then navigate on success
        this.cartSubscription = this.cartService.addToCart(productToAdd).subscribe({
            next: () => {
                console.log('Successfully added to cart for Buy Now, navigating...');
                this.router.navigate(['/checkout']); // Navigate to checkout
            },
            error: (err) => {
                console.error('Error adding item for Buy Now from detail:', err);
                this.errorMessage = err.message || 'فشل في إضافة المنتج للسلة قبل الشراء.';
                alert(`خطأ: ${this.errorMessage}`);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/shop']); // Navigate back to the shop page
        // Alternatively, use Location service for browser history back
        // import { Location } from '@angular/common';
        // constructor(private location: Location) {}
        // goBack(): void { this.location.back(); }
    }
} 