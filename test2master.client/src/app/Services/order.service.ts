import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// --- Define and Export DTOs ---
export interface OrderItemDTO {
    productName: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    // Add other relevant fields if needed
}

export interface OrderDetailDTO {
    orderId: number;
    orderDate: string; // Or Date
    totalAmount: number;
    status: string;
    orderItems: OrderItemDTO[];
    // Add other relevant fields like shipping address etc. if needed
}

// Request DTO for creating an order (matches backend CreateOrderRequestDTO)
export interface CreateOrderRequest {
    paymentMethod: string;
    shippingPhoneNumber: string;
    shippingAddressLine1: string;
    shippingAddressLine2?: string;
    shippingCity: string;
}

// Response DTO for create order (already defined)
export interface CreateOrderResponse {
    message: string;
    orderIds: number[];
    requiresPayment: boolean;
    primaryOrderId?: number;
}

// -----------------------------

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    // Use hardcoded base URL
    private baseUrl = 'https://localhost:7158/Order'; // Hardcoded URL

    constructor(private http: HttpClient) { }

    /**
     * Creates a new order(s) with shipping information.
     * @param orderData Object containing paymentMethod and shipping details.
     * @returns Observable containing the result of the order creation attempt.
     */
    createOrder(orderData: CreateOrderRequest): Observable<CreateOrderResponse> {
        console.log('OrderService: Sending order data:', orderData);
        // The body now contains the complete orderData object
        return this.http.post<CreateOrderResponse>(this.baseUrl, orderData)
            .pipe(
                catchError(this.handleError)
            );
    }

    getMyOrders(status?: string): Observable<OrderDetailDTO[]> {
        let params = new HttpParams();
        if (status) {
            params = params.set('status', status);
        }
        // Construct URL for getMyOrders
        return this.http.get<OrderDetailDTO[]>(`${this.baseUrl}/MyOrders`, { params })
            .pipe(catchError(this.handleError));
    }

    cancelOrder(orderId: number): Observable<any> { // Replace 'any' with a specific response type
        // Construct URL for cancelOrder
        return this.http.put<any>(`${this.baseUrl}/${orderId}/cancel`, {})
            .pipe(catchError(this.handleError));
    }

    // --- New method for Buyer ---
    /**
     * Marks an order as delivered by the buyer.
     * @param orderId The ID of the order to mark as delivered.
     * @returns Observable with the success message or error.
     */
    markOrderAsDelivered(orderId: number): Observable<{ message: string }> {
        console.log(`Marking order ${orderId} as delivered by buyer.`);
        return this.http.put<{ message: string }>(`${this.baseUrl}/${orderId}/mark-delivered`, {})
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('Order Service Error:', error);
        let errorMessage = 'An unknown error occurred while processing your order!';
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Backend error
            if (error.error && error.error.message) {
                errorMessage = error.error.message;
            } else {
                errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
            }
        }
        return throwError(() => new Error(errorMessage));
    }
} 