import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces matching the backend DTOs
export interface OrderItemDTO {
    productId: number; // Assuming product IDs are standard ints in frontend
    productName: string;
    quantity: number;
    price: number;
    imageUrl: string | null;
}

export interface OrderDetailDTO {
    orderId: number; // Assuming order IDs are standard ints in frontend
    orderDate: string; // Dates are strings from JSON
    totalAmount: number;
    status: string;
    orderItems: OrderItemDTO[];
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    private apiUrl = 'https://localhost:7158/Order'; // Adjust if needed

    constructor(private http: HttpClient) { }

    // Get orders for the current user, optionally filtered by status
    getMyOrders(status?: string): Observable<OrderDetailDTO[]> {
        let params = new HttpParams();
        if (status) {
            params = params.set('status', status);
        }

        console.log(`OrderService: Fetching my orders with status: ${status || 'All'}`)
        return this.http.get<OrderDetailDTO[]>(`${this.apiUrl}/MyOrders`, { params }).pipe(
            catchError(this.handleError)
        );
    }

    // Create a new order (Checkout process)
    createOrder(checkoutData: any): Observable<any> { // Define a specific DTO for checkoutData if possible
        // The actual checkout endpoint might be different, e.g., /Order or /Checkout
        // The backend will handle fetching cart items for the user based on their token.
        console.log('OrderService: Creating order with data:', checkoutData);
        return this.http.post<any>(`${this.apiUrl}`, checkoutData).pipe( // Assuming POST /Order
            catchError(this.handleError)
        );
    }

    // Cancel an order
    cancelOrder(orderId: number): Observable<any> {
        console.log(`OrderService: Cancelling order ${orderId}...`);
        const url = `${this.apiUrl}/${orderId}/cancel`;
        // The body is empty for this PUT request as per the backend implementation
        return this.http.put<any>(url, {}).pipe(
            catchError(this.handleError)
        );
    }

    // Basic error handler
    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('OrderService Error:', error);
        let errorMessage = 'An unknown error occurred with the order service!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            errorMessage = `Server Error (Status ${error.status}): ${error.message}`;
            if (error.error && error.error.message) { // Use backend message if available
                errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
                errorMessage = error.error; // Fallback to string error
            }
        }
        console.error('Backend Error Details (if any):', error.error);
        return throwError(() => new Error(errorMessage));
    }
} 