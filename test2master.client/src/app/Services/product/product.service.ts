import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    // Adjust the base URL to your actual backend API URL
    private baseUrl = 'https://localhost:7158'; // Make sure this matches your backend port

    constructor(private http: HttpClient) { }

    // Fetch products for the shop page
    getShopProducts(): Observable<ShopProductDTO[]> {
        const url = `${this.baseUrl}/Product/listProduct`;
        console.log('ProductService: Fetching shop products from:', url);
        return this.http.get<ShopProductDTO[]>(url).pipe(
            catchError(this.handleError)
        );
    }

    // --- Updated getProductById to return ProductDetailDTO ---
    getProductById(id: string): Observable<ProductDetailDTO> {
        const url = `${this.baseUrl}/Product/GetProductBy${id}`;
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