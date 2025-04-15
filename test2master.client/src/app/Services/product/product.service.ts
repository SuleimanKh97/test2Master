import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

// Interface matching the backend ShopProductDTO
export interface ShopProductDTO {
    id: number;
    name: string;
    description: string;
    price: number;
    img: string;
    sellerName: string;
}

// --- Interface matching the backend ProductDetailDTO ---
export interface ProductDetailDTO {
    id: number;
    name: string;
    description: string;
    price: number;
    img: string;
    categoryName: string;
    sellerName: string;
    createdAt: string | null; // Dates usually come as strings from JSON
}
// -------------------------------------------------------

// Interface for the category list from backend
export interface CategoryDTO {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    // Adjust the base URL to your actual backend API URL
    private baseUrl = 'https://localhost:7158'; // *** Reverted Port to 7158 ***
    private productApiUrl = `${this.baseUrl}/Product`;

    constructor(private http: HttpClient) { }

    // Fetch products for the shop page with optional filters
    getShopProducts(categoryId?: number, minPrice?: number, maxPrice?: number, searchQuery?: string): Observable<ShopProductDTO[]> {
        let params = new HttpParams();
        if (categoryId && categoryId > 0) {
            params = params.set('categoryId', categoryId.toString());
        }
        if (minPrice !== undefined && minPrice !== null) {
            params = params.set('minPrice', minPrice.toString());
        }
        if (maxPrice !== undefined && maxPrice !== null) {
            params = params.set('maxPrice', maxPrice.toString());
        }
        if (searchQuery && searchQuery.trim() !== '') {
            params = params.set('searchQuery', searchQuery.trim());
        }

        const url = `${this.productApiUrl}/listProduct`;
        console.log('ProductService: Fetching shop products from:', url, 'with params:', params.toString());
        return this.http.get<ShopProductDTO[]>(url, { params }).pipe(
            catchError(this.handleError)
        );
    }

    // Fetch available categories
    getCategories(): Observable<CategoryDTO[]> {
        const url = `${this.productApiUrl}/categories`;
        console.log('ProductService: Fetching categories from:', url);
        return this.http.get<CategoryDTO[]>(url).pipe(
            catchError(this.handleError)
        );
    }

    // --- Updated getProductById to return ProductDetailDTO ---
    getProductById(id: string): Observable<ProductDetailDTO> {
        const url = `${this.productApiUrl}/GetProductBy${id}`;
        console.log('ProductService: Fetching product details from:', url);
        return this.http.get<ProductDetailDTO>(url).pipe(
            catchError(this.handleError) // Use the shared error handler
        );
    }
    // -------------------------------------------------------

    // Basic error handler
    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('ProductService Error:', error);
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            errorMessage = `Server Error (Status ${error.status}): ${error.message}`;
            // Try to get more specific error message from backend response
            if (error.error && typeof error.error === 'object' && error.error.message) {
                errorMessage = error.error.message; // Use message from backend if available
            }
            else if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
            }
        }
        console.error('Backend Error Details (if any):', error.error);
        return throwError(() => new Error(errorMessage));
    }
} 