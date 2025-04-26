import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface matching backend C# Product model (more or less)
export interface SellerProduct {
    id?: number; // Assuming ID is number, optional for add
    name: string;
    description: string;
    price: number;
    categoryId: number; // Assuming category ID is required
    img?: string; // Image URL or path
    createdAt?: Date | string;
    sellerId?: number; // Backend might set this automatically based on auth
    isSold?: boolean; // Property indicating if the product is sold
    // Remove fields not directly part of Product model like stockQuantity if handled differently
}

// Interface matching backend CreateProductRequest DTO
export interface AddProductModel {
    name: string;
    description: string;
    price: number;
    categoryId: number;
    img?: string;
    // sellerId is usually not sent, derived from auth token backend
}


@Injectable({
    providedIn: 'root'
})
export class SellerProductService {

    // Use the full base path for the Seller controller
    private apiUrl = 'https://localhost:7158/Seller'; // Updated API URL

    constructor(private http: HttpClient) { }

    // Re-usable helper for auth headers
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("SellerProductService: Auth token not found.");
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        });
    }

    /** Fetches the list of products for the CURRENT seller from API */
    getSellerProducts(): Observable<SellerProduct[]> {
        console.log('SellerProductService: Fetching seller products from API...');
        // REAL IMPLEMENTATION (Backend handles filtering based on auth token)
        return this.http.get<SellerProduct[]>(`${this.apiUrl}/products`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Fetches details for a specific product ID from API */
    getProductById(productId: number): Observable<SellerProduct> {
        console.log(`SellerProductService: Fetching product ${productId} from API...`);
        // REAL IMPLEMENTATION (Backend should authorize if the product belongs to the seller)
        return this.http.get<SellerProduct>(`${this.apiUrl}/products/${productId}`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Adds a new product via API */
    addProduct(productData: AddProductModel): Observable<any> { // Expect AddProductModel
        console.log('SellerProductService: Adding new product via API...', productData);
        // REAL IMPLEMENTATION (Backend associates the product with the seller based on the auth token)
        return this.http.post<any>(`${this.apiUrl}/products`, productData, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Updates an existing product via API */
    updateProduct(productId: number, productData: AddProductModel): Observable<any> { // Expect AddProductModel for update too
        console.log(`SellerProductService: Updating product ${productId} via API...`, productData);
        // REAL IMPLEMENTATION (Backend handles authorization)
        return this.http.put<any>(`${this.apiUrl}/products/${productId}`, productData, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Deletes a product via API */
    deleteProduct(productId: number): Observable<any> { // Return type might be any or specific {message: string}
        console.log(`SellerProductService: Deleting product ${productId} via API...`);
        // REAL IMPLEMENTATION (Backend handles authorization)
        return this.http.delete<any>(`${this.apiUrl}/products/${productId}`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    // Re-usable, improved error handling
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = error.error?.message || `Server error (status ${error.status})`;
        }
        console.error('Seller API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
} 