import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

// Re-use or define a Product interface relevant for Admin
// Can be the same as SellerProduct for simplicity now
import { SellerProduct as AdminProduct } from '../seller/seller-product.service'; // Alias for clarity

@Injectable({
    providedIn: 'root'
})
export class AdminProductService {

    private apiUrl = '/api/admin/products'; // Example API endpoint

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    /** Fetches all products in the system */
    getAllProducts(): Observable<AdminProduct[]> {
        console.log('AdminProductService: Fetching all products (mock)...');
        // --- MOCK IMPLEMENTATION ---
        // Return a combined list, potentially including products from different sellers
        const mockProducts: AdminProduct[] = [
            { id: 'p1', sellerId: 'seller1', name: 'منتج بائع 1', description: 'وصف المنتج الأول', price: 150, stockQuantity: 20, imageUrl: 'https://via.placeholder.com/150/aaaaaa/ffffff?text=P1' },
            { id: 'p2', sellerId: 'seller1', name: 'منتج بائع 2', description: 'وصف المنتج الثاني', price: 99.99, stockQuantity: 5, imageUrl: 'https://via.placeholder.com/150/bbbbbb/ffffff?text=P2' },
            { id: 'p3', sellerId: 'seller2', name: 'منتج بائع آخر', description: 'وصف من بائع آخر', price: 45, stockQuantity: 10, imageUrl: 'https://via.placeholder.com/150/cccccc/ffffff?text=P3' },
            { id: 'p4', sellerId: 'seller1', name: 'منتج بائع 1 جديد', description: 'وصف المنتج الرابع', price: 250, stockQuantity: 15, imageUrl: 'https://via.placeholder.com/150/dddddd/ffffff?text=P4' }
        ];
        return of(mockProducts).pipe(delay(900));
        // --- END MOCK ---
        // // REAL: return this.http.get<AdminProduct[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    /** Updates any product */
    updateProduct(productId: string | number, productData: AdminProduct): Observable<any> {
        console.log(`AdminProductService: Updating product ${productId} (mock)...`, productData);
        // --- MOCK IMPLEMENTATION ---
        if (Math.random() < 0.1) return throwError(() => ({ status: 500, message: 'Failed to update product (mock)' })).pipe(delay(700));
        return of({ message: 'Product updated successfully (mock)' }).pipe(delay(700));
        // --- END MOCK ---
        // // REAL: return this.http.put(`${this.apiUrl}/${productId}`, productData, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    /** Deletes any product */
    deleteProduct(productId: string | number): Observable<any> {
        console.log(`AdminProductService: Deleting product ${productId} (mock)...`);
        // --- MOCK IMPLEMENTATION ---
        if (Math.random() < 0.05) return throwError(() => ({ status: 500, message: 'Failed to delete product (mock)' })).pipe(delay(600));
        return of({ message: 'Product deleted successfully (mock)' }).pipe(delay(800));
        // --- END MOCK ---
        // // REAL: return this.http.delete(`${this.apiUrl}/${productId}`, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    // Basic error handling
    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        let errorMessage = error.error?.message || error.message || 'An unknown error occurred!';
        return throwError(() => new Error(errorMessage));
    }
} 