import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs'; // Import 'of' and 'throwError' for mock data
import { catchError, delay, map } from 'rxjs/operators';

// Updated interface to include sellerId
export interface SellerProduct {
    id?: string | number; // Optional for new products
    sellerId?: string | number; // Added sellerId (optional for reading, required for adding)
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string; // Optional
    // Add other relevant product fields: category, status, etc.
}

@Injectable({
    providedIn: 'root'
})
export class SellerProductService {

    // Adjust the base URL to your actual API endpoint for seller products
    private apiUrl = '/api/seller/products'; // Example API endpoint

    // In-memory store for mock data
    private mockProductStore: SellerProduct[] = [
        { id: 'p1', sellerId: 'seller1', name: 'منتج بائع 1', description: 'وصف المنتج الأول', price: 150, stockQuantity: 20, imageUrl: 'https://via.placeholder.com/150/aaaaaa/ffffff?text=Mock1' },
        { id: 'p2', sellerId: 'seller1', name: 'منتج بائع 2', description: 'وصف المنتج الثاني', price: 99.99, stockQuantity: 5, imageUrl: 'https://via.placeholder.com/150/bbbbbb/ffffff?text=Mock2' },
        { id: 'p3', sellerId: 'seller2', name: 'منتج بائع آخر', description: 'وصف من بائع آخر', price: 45, stockQuantity: 10, imageUrl: 'https://via.placeholder.com/150/cccccc/ffffff?text=MockOther' } // Added product from another seller
    ];
    private nextId = 4; // Simple ID generation for mock data

    constructor(private http: HttpClient) { }

    // Helper to get current seller ID from localStorage
    private getCurrentSellerId(): string | null {
        // Assuming the user ID is stored as 'userId' after login
        return localStorage.getItem('userId');
    }

    // Helper to get authorization headers (assuming token is stored in localStorage)
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token'); // Or however you store the auth token
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    /**
     * Fetches the list of products for the CURRENT seller from the in-memory store.
     */
    getSellerProducts(): Observable<SellerProduct[]> {
        console.log('SellerProductService: Fetching seller products from mock store...');
        const currentSellerId = this.getCurrentSellerId();
        if (!currentSellerId) {
            console.error('Seller ID not found in localStorage for getSellerProducts');
            return throwError(() => new Error('Seller ID not found. Please log in again.'));
        }
        console.log(`Filtering products for seller ID: ${currentSellerId}`);

        // --- MOCK IMPLEMENTATION (using store and filtering by sellerId) ---
        const sellerProducts = this.mockProductStore.filter(p => p.sellerId == currentSellerId);
        return of([...sellerProducts]).pipe(delay(500)); // Return a copy
        // --- END MOCK --- 

        // // --- REAL IMPLEMENTATION (Backend handles filtering) ---
        // return this.http.get<SellerProduct[]>(this.apiUrl, { headers: this.getAuthHeaders() })
        //   .pipe(catchError(this.handleError));
        // // --- END REAL --- 
    }

    /**
     * Fetches details for a specific product ID, ensuring it belongs to the current seller.
     */
    getProductById(productId: string | number): Observable<SellerProduct> {
        console.log(`SellerProductService: Fetching product with ID: ${productId} from mock store...`);
        const currentSellerId = this.getCurrentSellerId();
        if (!currentSellerId) {
            console.error('Seller ID not found in localStorage for getProductById');
            return throwError(() => new Error('Seller ID not found. Please log in again.'));
        }

        // --- MOCK IMPLEMENTATION (using store) ---
        const product = this.mockProductStore.find(p => p.id == productId && p.sellerId == currentSellerId);
        if (!product) {
            return throwError(() => ({ status: 404, message: 'Product not found or does not belong to this seller (mock store)' })).pipe(delay(300));
        }
        return of({ ...product }).pipe(delay(300)); // Return a copy
        // --- END MOCK --- 

        // // --- REAL IMPLEMENTATION (Backend handles filtering/authorization) ---
        // return this.http.get<SellerProduct>(`${this.apiUrl}/${productId}`, { headers: this.getAuthHeaders() })
        //   .pipe(catchError(this.handleError));
        // // --- END REAL --- 
    }

    /**
     * Adds a new product to the in-memory store, associating it with the current seller.
     */
    addProduct(productData: SellerProduct): Observable<SellerProduct> {
        console.log('SellerProductService: Adding new product to mock store...', productData);
        const currentSellerId = this.getCurrentSellerId();
        if (!currentSellerId) {
            console.error('Seller ID not found in localStorage for addProduct');
            return throwError(() => new Error('Seller ID not found. Cannot add product.'));
        }

        // --- MOCK IMPLEMENTATION (using store) ---
        if (!productData.name || productData.price <= 0) {
            return throwError(() => ({ status: 400, message: 'بيانات المنتج غير صالحة (محاكاة)' })).pipe(delay(500));
        }
        const newProduct: SellerProduct = {
            ...productData,
            sellerId: currentSellerId, // Assign current seller ID
            id: `p${this.nextId++}`
        };
        this.mockProductStore.push(newProduct);
        console.log('Current mock store:', this.mockProductStore);
        return of(newProduct).pipe(delay(800));
        // --- END MOCK --- 

        // // --- REAL IMPLEMENTATION ---
        // // Backend associates the product with the seller based on the auth token
        // return this.http.post<SellerProduct>(this.apiUrl, productData, { headers: this.getAuthHeaders() })
        //   .pipe(catchError(this.handleError));
        // // --- END REAL --- 
    }

    /**
     * Updates an existing product in the in-memory store, checking seller ownership.
     */
    updateProduct(productId: string | number, productData: SellerProduct): Observable<SellerProduct> {
        console.log(`SellerProductService: Updating product ${productId} in mock store...`, productData);
        const currentSellerId = this.getCurrentSellerId();
        if (!currentSellerId) {
            console.error('Seller ID not found in localStorage for updateProduct');
            return throwError(() => new Error('Seller ID not found. Cannot update product.'));
        }

        // --- MOCK IMPLEMENTATION (using store) ---
        const productIndex = this.mockProductStore.findIndex(p => p.id == productId && p.sellerId == currentSellerId);
        if (productIndex === -1) {
            return throwError(() => ({ status: 404, message: 'Product not found or does not belong to this seller (mock store)' })).pipe(delay(500));
        }
        if (!productData.name || productData.price <= 0) {
            return throwError(() => ({ status: 400, message: 'بيانات المنتج غير صالحة (محاكاة)' })).pipe(delay(500));
        }
        // Ensure sellerId isn't overwritten if not included in productData
        const updatedProduct: SellerProduct = { ...productData, id: productId, sellerId: currentSellerId };
        this.mockProductStore[productIndex] = updatedProduct;
        console.log('Current mock store:', this.mockProductStore);
        return of(updatedProduct).pipe(delay(600));
        // --- END MOCK --- 

        // // --- REAL IMPLEMENTATION (Backend handles authorization) ---
        // return this.http.put<SellerProduct>(`${this.apiUrl}/${productId}`, productData, { headers: this.getAuthHeaders() })
        //   .pipe(catchError(this.handleError));
        // // --- END REAL --- 
    }

    /**
     * Deletes a product from the in-memory store, checking seller ownership.
     */
    deleteProduct(productId: string | number): Observable<{ message: string }> {
        console.log(`SellerProductService: Deleting product ${productId} from mock store...`);
        const currentSellerId = this.getCurrentSellerId();
        if (!currentSellerId) {
            console.error('Seller ID not found in localStorage for deleteProduct');
            return throwError(() => new Error('Seller ID not found. Cannot delete product.'));
        }

        // --- MOCK IMPLEMENTATION (using store) ---
        const initialLength = this.mockProductStore.length;
        const productToDelete = this.mockProductStore.find(p => p.id == productId && p.sellerId == currentSellerId);

        if (!productToDelete) {
            return throwError(() => ({ status: 404, message: 'Product not found or does not belong to this seller (mock store)' })).pipe(delay(400));
        }

        this.mockProductStore = this.mockProductStore.filter(p => p.id != productId);
        console.log('Current mock store:', this.mockProductStore);
        return of({ message: 'تم حذف المنتج بنجاح (محاكاة)' }).pipe(delay(500));
        // --- END MOCK --- 

        // // --- REAL IMPLEMENTATION (Backend handles authorization) ---
        // return this.http.delete<{ message: string }>(`${this.apiUrl}/${productId}`, { headers: this.getAuthHeaders() })
        //   .pipe(catchError(this.handleError));
        // // --- END REAL --- 
    }

    // Basic error handling (can be expanded)
    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            if (error.error && typeof error.error === 'object' && error.error.message) {
                errorMessage = error.error.message; // Use specific message from backend if available
            }
        }
        // You might want to use a logging service here
        return throwError(() => new Error(errorMessage));
    }
} 