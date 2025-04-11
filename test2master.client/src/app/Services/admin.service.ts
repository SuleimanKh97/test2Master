import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// --- Define DTOs mirroring the backend AdminDTOs ---
export interface AdminOrderItemDTO {
    productId: number; // Note: JS/TS uses camelCase usually
    productName: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    sellerId?: number;
    sellerUsername?: string;
}

export interface AdminOrderDetailDTO {
    orderId: number;
    buyerUserId: number;
    buyerUsername: string;
    orderDate: string; // Or Date
    totalAmount: number;
    status: string;
    paymentMethod: string;
    transactionDate?: string; // Or Date
    orderItems: AdminOrderItemDTO[];
}
// --------------------------------------------------

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    // Use hardcoded base URL (adjust controller name if needed)
    private baseUrl = 'https://localhost:7158/Admin'; // Adjust if your controller route is different

    constructor(private http: HttpClient) { }

    /**
     * Fetches all orders with detailed information for the admin view.
     * @returns Observable containing an array of admin order details.
     */
    getAllOrders(): Observable<AdminOrderDetailDTO[]> {
        console.log('Admin fetching all orders...');
        return this.http.get<AdminOrderDetailDTO[]>(`${this.baseUrl}/Orders`)
            .pipe(
                catchError(this.handleError)
            );
    }

    // Add other admin-related methods here (e.g., getUsers, getProducts)

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('Admin Service Error:', error);
        let errorMessage = 'An unknown error occurred in the admin service!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client-side error: ${error.error.message}`;
        } else {
            if (error.status === 403) {
                errorMessage = "Forbidden: You do not have permission to access this resource.";
            } else if (error.error && typeof error.error === 'object' && error.error.message) {
                errorMessage = `Server error: ${error.error.message}`;
            } else if (error.statusText) {
                errorMessage = `Server error: ${error.status} - ${error.statusText}`;
            } else if (error.status === 0) {
                errorMessage = 'Could not connect to the server.';
            }
        }
        return throwError(() => new Error(errorMessage));
    }
} 