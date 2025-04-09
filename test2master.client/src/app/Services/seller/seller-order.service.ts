import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

// Placeholder interface for Order data relevant to the seller
// Adjust based on your actual Order model and what the seller needs to see
export interface SellerOrder {
    orderId: string | number;
    orderDate: Date | string;
    customerName: string; // Or customer ID/email
    totalAmount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'; // Example statuses
    items: SellerOrderItem[]; // Details of items sold by this seller in the order
}

export interface SellerOrderItem {
    productId: string | number;
    productName: string;
    quantity: number;
    price: number; // Price per unit at the time of order
}

@Injectable({
    providedIn: 'root'
})
export class SellerOrderService {

    // Adjust the base URL to your actual API endpoint for seller orders
    private apiUrl = '/api/seller/orders'; // Example API endpoint

    constructor(private http: HttpClient) { }

    // Helper to get authorization headers
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    /**
     * Fetches the list of orders containing products sold by the currently logged-in seller.
     */
    getSellerOrders(): Observable<SellerOrder[]> {
        console.log('SellerOrderService: Fetching seller orders...');

        // --- MOCK IMPLEMENTATION ---
        const mockOrders: SellerOrder[] = [
            {
                orderId: 'order101',
                orderDate: new Date(),
                customerName: 'مشتري ١',
                totalAmount: 195.00, // Total for items sold by this seller in this order
                status: 'Processing',
                items: [
                    { productId: 'p1', productName: 'منتج بائع 1', quantity: 1, price: 150 },
                    { productId: 'p3', productName: 'منتج بائع 3', quantity: 1, price: 45 }
                ]
            },
            {
                orderId: 'order102',
                orderDate: new Date(Date.now() - 86400000), // Yesterday
                customerName: 'مشتري ٢',
                totalAmount: 99.99,
                status: 'Shipped',
                items: [
                    { productId: 'p2', productName: 'منتج بائع 2', quantity: 1, price: 99.99 }
                ]
            },
            {
                orderId: 'order103',
                orderDate: new Date(Date.now() - 172800000), // Two days ago
                customerName: 'مشتري ١', // Same customer, different order
                totalAmount: 300.00,
                status: 'Delivered',
                items: [
                    { productId: 'p1', productName: 'منتج بائع 1', quantity: 2, price: 150 }
                ]
            }
        ];
        return of(mockOrders).pipe(delay(1200)); // Simulate network delay
        // --- END MOCK --- 

        // // --- REAL IMPLEMENTATION ---
        // return this.http.get<SellerOrder[]>(this.apiUrl, { headers: this.getAuthHeaders() })
        //   .pipe(catchError(this.handleError));
        // // --- END REAL --- 
    }

    // Potential future methods: getOrderDetails(orderId), updateOrderStatus(orderId, status)

    // Basic error handling
    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            if (error.error && typeof error.error === 'object' && error.error.message) {
                errorMessage = error.error.message;
            }
        }
        return throwError(() => new Error(errorMessage));
    }
} 