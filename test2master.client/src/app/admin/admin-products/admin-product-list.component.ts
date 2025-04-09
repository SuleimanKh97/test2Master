import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminProductService } from '../../Services/admin/admin-product.service';
import { SellerProduct as AdminProduct } from '../../Services/seller/seller-product.service'; // Reuse interface

@Component({
    selector: 'app-admin-product-list',
    standalone: true,
    imports: [CommonModule, RouterModule, CurrencyPipe],
    providers: [CurrencyPipe],
    templateUrl: './admin-product-list.component.html',
    styleUrls: ['./admin-product-list.component.css'] // Shares styles with user list for now
})
export class AdminProductListComponent implements OnInit {
    products$: Observable<AdminProduct[]> = of([]);
    isLoading = true;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    constructor(private adminProductService: AdminProductService) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.isLoading = true;
        this.errorMessage = null;
        this.products$ = this.adminProductService.getAllProducts().pipe(
            catchError(err => {
                this.errorMessage = err.message || 'Failed to load products.';
                this.isLoading = false;
                return of([]);
            })
        );
        this.products$.subscribe(() => this.isLoading = false);
    }

    deleteProduct(productId: string | number | undefined): void {
        if (!productId) return;
        if (!confirm('Are you sure you want to delete this product?')) return;

        console.log(`Attempting to delete product: ${productId}`);
        this.adminProductService.deleteProduct(productId).subscribe({
            next: (res) => {
                this.successMessage = res.message || 'Product deleted successfully.';
                this.loadProducts(); // Refresh list
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => this.errorMessage = err.message || 'Failed to delete product.'
        });
    }

    // Placeholder for navigating to an edit form (form component not created yet)
    editProduct(productId: string | number | undefined): void {
        if (!productId) return;
        console.log(`Navigate to edit product ${productId} - requires form component and routing`);
        // this.router.navigate(['/admin/products/edit', productId]); 
    }
} 