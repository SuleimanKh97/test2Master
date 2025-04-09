import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Needed for routerLink
import { SellerProduct, SellerProductService } from '../../Services/seller/seller-product.service'; // Import service and interface
import { Observable, of } from 'rxjs'; // Import Observable and of for handling data stream
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-seller-product-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule // Add RouterModule to imports
    ],
    templateUrl: './seller-product-list.component.html',
    styleUrls: ['./seller-product-list.component.css']
})
export class SellerProductListComponent implements OnInit {

    sellerProducts$: Observable<SellerProduct[]> = of([]); // Initialize with empty observable
    isLoading = true;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    constructor(
        private sellerProductService: SellerProductService,
        private router: RouterModule // Inject RouterModule (can just use routerLink directly in template)
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.isLoading = true;
        this.errorMessage = null;
        this.sellerProducts$ = this.sellerProductService.getSellerProducts().pipe(
            catchError(err => {
                console.error('Error loading seller products:', err);
                this.errorMessage = 'حدث خطأ أثناء جلب المنتجات. يرجى المحاولة مرة أخرى.';
                this.isLoading = false;
                return of([]); // Return empty array on error to clear the list
            })
        );

        // We can track loading state separately if needed, or use async pipe characteristics
        this.sellerProducts$.subscribe(() => this.isLoading = false); // Basic loading indicator handling
    }

    // Method to navigate to the add product form (implement component later)
    navigateToAddProduct(): void {
        //this.router.navigate(['/seller/products/add']); // Correct navigation requires Router service
        console.log('Navigate to add product - requires Router service');
        // Note: Direct navigation needs Router from '@angular/router', not RouterModule
        // Will fix injection if direct navigation is preferred over routerLink
    }

    // Method to navigate to the edit product form (implement component later)
    navigateToEditProduct(productId: string | number | undefined): void {
        if (!productId) return;
        // this.router.navigate(['/seller/products/edit', productId]);
        console.log(`Navigate to edit product ${productId} - requires Router service`);
    }

    // Method to handle product deletion
    deleteProduct(productId: string | number | undefined): void {
        if (!productId) return;

        // Confirmation dialog
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
            return;
        }

        this.isLoading = true; // Show loading indicator during deletion
        this.errorMessage = null;
        this.successMessage = null;

        // Convert productId to number before calling the service
        this.sellerProductService.deleteProduct(Number(productId)).subscribe({
            next: (response) => {
                console.log('Product deleted successfully', response);
                this.successMessage = response.message || 'تم حذف المنتج بنجاح.';
                this.isLoading = false;
                this.loadProducts(); // Refresh the list after deletion
                // Auto-hide success message after a few seconds
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => {
                console.error('Error deleting product:', err);
                this.errorMessage = err.message || 'حدث خطأ أثناء حذف المنتج.';
                this.isLoading = false;
            }
        });
    }
} 