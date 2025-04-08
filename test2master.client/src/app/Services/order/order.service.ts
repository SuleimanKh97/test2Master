import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Optional: Define an interface for the Order data
export interface Order {
    id: number;
    userId: number;
    totalPrice: number;
    createdAt: string; // or Date
    status: string;
    // Add order items if needed
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    // Base URL for Buyer endpoints - Adjust port if needed
    private buyerApiUrl = 'https://localhost:7158/Buyer';

    constructor(private http: HttpClient) { }

    /**
     * Fetches the order history for the currently logged-in user.
     * Assumes TokenInterceptor adds the necessary Authorization header.
     */
    getOrderHistory(): Observable<Order[]> { // Expect an array of Order objects
        return this.http.get<Order[]>(`${this.buyerApiUrl}/orders`);
    }

    /**
     * Calls the backend endpoint to finalize the order from the user's cart.
     * Assumes TokenInterceptor adds the necessary Authorization header.
     */
    checkout(): Observable<any> { // The backend returns { message, totalAmount }
        return this.http.post(`${this.buyerApiUrl}/checkout`, {}); // Send POST request with empty body
    }

    // Add other order-related methods if necessary (e.g., getOrderDetails(id))
} 