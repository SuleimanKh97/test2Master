import { Component, OnInit } from '@angular/core';
import { ProductService, ShopProductDTO } from '../Services/product/product.service';
import { CartService } from '../Services/cart/cart.service';
import { Router } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../Models/product.module'; // Import the Product model
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
    selector: 'app-shop',
    standalone: true, // Add standalone: true if it's not already there
    imports: [
        CommonModule, // Add CommonModule here
        // Add other necessary imports like RouterLink if needed, though often handled by AppModule
    ],
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {

    products$: Observable<ShopProductDTO[]> | undefined;
    errorMessage: string | null = null;

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private router: Router
    ) { }

    ngOnInit(): void {
        console.log('ShopComponent: Initializing...');
        this.loadProducts();
    }

    loadProducts(): void {
        console.log('ShopComponent: Loading products...');
        this.errorMessage = null;
        this.products$ = this.productService.getShopProducts()
            .pipe(
                catchError(err => {
                    console.error('ShopComponent: Error loading products', err);
                    this.errorMessage = `Failed to load products: ${err.message || 'Unknown error'}`;
                    return EMPTY;
                })
            );
    }

    addToCart(productDto: ShopProductDTO): void {
        console.log('Adding to cart DTO:', productDto);
        this.errorMessage = null;

        const productToAdd: Product = {
            id: productDto.id,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            imageUrl: productDto.img,
            originalPrice: productDto.price,
            category: 'Unknown'
        };

        this.cartService.addToCart(productToAdd).subscribe({
            next: (updatedCart) => {
                console.log('Successfully added to cart via service');
                alert(`تمت إضافة '${productDto.name}' إلى السلة بنجاح!`);
            },
            error: (err) => {
                console.error('Error adding item via service:', err);
                this.errorMessage = err.message || 'فشل في إضافة المنتج للسلة.';
                alert(`خطأ: ${this.errorMessage}`);
            }
        });
    }

    buyNow(productDto: ShopProductDTO): void {
        console.log('Buying now DTO:', productDto);
        this.errorMessage = null;

        const productToAdd: Product = {
            id: productDto.id,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            imageUrl: productDto.img,
            originalPrice: productDto.price,
            category: 'Unknown'
        };

        this.cartService.addToCart(productToAdd).subscribe({
            next: () => {
                console.log('Added to cart for Buy Now, navigating to checkout...');
                this.router.navigate(['/checkout']);
            },
            error: (err) => {
                console.error('Error adding item for Buy Now:', err);
                this.errorMessage = err.message || 'فشل في إضافة المنتج للسلة قبل الانتقال للدفع.';
                alert(`خطأ: ${this.errorMessage}`);
            }
        });
    }

    viewDetails(productId: number): void {
        console.log('Viewing details for product ID:', productId);
        this.router.navigate(['/product', productId]); // Adjust route if needed
    }
} 