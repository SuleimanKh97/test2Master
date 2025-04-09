import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define an interface for the Product model expected from the backend API
// Adjust fields based on the actual C# Product model
export interface AdminProduct {
    id: number | string;
    name: string;
    description?: string; // Optional?
    price: number;
    img?: string; // Assuming backend sends image URL
    createdAt?: Date | string;
    categoryId?: number | string;
    sellerId?: number | string; // If admin needs to see the seller
    // Add any other fields returned by GET /Admin/products
}

@Injectable({
    providedIn: 'root'
})
export class AdminProductService {

    // Use the full base path for the admin controller
    private apiUrl = 'https://localhost:7158/Admin'; // Updated API URL

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("AdminProductService: Auth token not found in localStorage.");
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        });
    }

    /** Fetches all products in the system from API */
    getAllProducts(): Observable<AdminProduct[]> {
        console.log('AdminProductService: Fetching all products from API...');
        return this.http.get<AdminProduct[]>(`${this.apiUrl}/products`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    // updateProduct removed as backend endpoint likely doesn't exist for admin
    /*
    updateProduct(productId: string | number, productData: AdminProduct): Observable<any> {
       // Implementation would require a PUT /Admin/products/{id} endpoint
    }
    */

    /** Deletes any product */
    deleteProduct(productId: string | number): Observable<any> {
        console.log(`AdminProductService: Deleting product ${productId} via API...`);
        return this.http.delete(`${this.apiUrl}/products/${productId}`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    // Improved error handling
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = error.error?.message || error.message || `Server error (status ${error.status})`;
        }
        console.error('API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
} 