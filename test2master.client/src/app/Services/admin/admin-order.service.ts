import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

// Placeholder for full Order model (might include more details than SellerOrder)
export interface AdminOrder {
    orderId: string | number;
    orderDate: Date | string;
    customerId: string | number; // Use ID instead of name maybe
    customerUsername: string;
    totalAmount: number; // Total amount of the whole order
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    items: AdminOrderItem[];
    // Add other fields: shippingAddress, paymentMethod etc.
}

export interface AdminOrderItem {
    productId: string | number;
    productName: string;
    sellerId: string | number; // Include seller ID
    quantity: number;
    price: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminOrderService {

    private apiUrl = '/api/admin/orders'; // Example API endpoint

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    /** Fetches all orders in the system */
    getAllOrders(): Observable<AdminOrder[]> {
        console.log('AdminOrderService: Fetching all orders (mock)...');
        // --- MOCK IMPLEMENTATION ---
        const mockOrders: AdminOrder[] = [
            {
                orderId: 'order101',
                orderDate: new Date(),
                customerId: 'u1',
                customerUsername: 'buyer1',
                totalAmount: 195.00,
                status: 'Processing',
                items: [
                    { productId: 'p1', productName: 'منتج بائع 1', sellerId: 'seller1', quantity: 1, price: 150 },
                    { productId: 'p3', productName: 'منتج بائع آخر', sellerId: 'seller2', quantity: 1, price: 45 }
                ]
            },
            {
                orderId: 'order102',
                orderDate: new Date(Date.now() - 86400000), // Yesterday
                customerId: 'u3',
                customerUsername: 'buyer2',
                totalAmount: 99.99,
                status: 'Shipped',
                items: [
                    { productId: 'p2', productName: 'منتج بائع 1', sellerId: 'seller1', quantity: 1, price: 99.99 }
                ]
            },
            {
                orderId: 'order103',
                orderDate: new Date(Date.now() - 172800000), // Two days ago
                customerId: 'u1',
                customerUsername: 'buyer1',
                totalAmount: 300.00,
                status: 'Delivered',
                items: [
                    { productId: 'p1', productName: 'منتج بائع 1', sellerId: 'seller1', quantity: 2, price: 150 }
                ]
            }
        ];
        return of(mockOrders).pipe(delay(1100));
        // --- END MOCK ---
        // // REAL: return this.http.get<AdminOrder[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    /** Updates an order's status */
    updateOrderStatus(orderId: string | number, newStatus: string): Observable<any> {
        console.log(`AdminOrderService: Updating status for order ${orderId} to ${newStatus} (mock)...`);
        // --- MOCK IMPLEMENTATION ---
        if (Math.random() < 0.1) return throwError(() => ({ status: 500, message: 'Failed to update status (mock)' })).pipe(delay(500));
        return of({ message: 'Order status updated successfully (mock)' }).pipe(delay(500));
        // --- END MOCK ---
        // // REAL: return this.http.put(`${this.apiUrl}/${orderId}/status`, { status: newStatus }, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    // Basic error handling
    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        let errorMessage = error.error?.message || error.message || 'An unknown error occurred!';
        return throwError(() => new Error(errorMessage));
    }
} 