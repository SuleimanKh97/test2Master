import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

// Placeholder interface for the expected PayPal create order response
interface PayPalCreateOrderResponse {
    orderID?: string;      // The ID of the order created in PayPal
    approvalUrl?: string; // The URL the user needs to visit to approve the payment
}

// Placeholder interface for the expected PayPal capture order response
interface PayPalCaptureOrderResponse {
    status: string; // e.g., 'COMPLETED'
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaypalService {

    // Mock backend API URLs (replace with actual later if needed)
    private createOrderUrl = '/api/paypal/create-order'; // Mock backend endpoint
    private captureOrderUrl = '/api/paypal/capture-order'; // Mock backend endpoint

    constructor(private http: HttpClient) { }

    /**
     * Calls the backend to create a PayPal order.
     * The backend should interact with the PayPal API to set up the transaction.
     * Returns an observable containing the PayPal order ID and the approval URL.
     */
    createOrder(): Observable<PayPalCreateOrderResponse> {
        console.log('PaypalService: Calling backend to create order...');

        // --- MOCK IMPLEMENTATION --- 
        // Simulate network delay and a successful response with a fake approval URL.
        // Replace this with actual http.post(this.createOrderUrl) later.
        const mockResponse: PayPalCreateOrderResponse = {
            orderID: `MOCK_PAYPAL_ORDER_${Date.now()}`,
            approvalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=MOCK_TOKEN' // Example sandbox URL 
        };
        return of(mockResponse).pipe(delay(1500)); // Simulate 1.5 seconds delay
        // --- END MOCK IMPLEMENTATION ---

        // // --- REAL IMPLEMENTATION (Example) ---
        // return this.http.post<PayPalCreateOrderResponse>(this.createOrderUrl, {}); 
        // // We send an empty body for now, backend uses context (e.g., cart, user) 
        // // to determine order details.
        // // --- END REAL IMPLEMENTATION ---
    }

    /**
     * Calls the backend to capture the payment for a PayPal order after user approval.
     * @param orderID The ID of the PayPal order that was approved by the user.
     * Returns an observable indicating the result of the capture.
     */
    captureOrder(orderID: string): Observable<PayPalCaptureOrderResponse> {
        console.log(`PaypalService: Calling backend to capture order ${orderID}...`);

        // --- MOCK IMPLEMENTATION ---
        // Simulate network delay and a successful capture.
        // Replace with actual http.post later.
        const mockResponse: PayPalCaptureOrderResponse = {
            status: 'COMPLETED',
            message: 'تم إتمام الدفع عبر PayPal بنجاح!'
        };
        return of(mockResponse).pipe(
            delay(1000), // Simulate 1 second delay
            // Simulate a small chance of failure for testing
            switchMap(response => {
                if (Math.random() < 0.1) { // 10% chance of simulated failure
                    console.warn('PaypalService: Simulating capture failure.');
                    return throwError(() => ({
                        error: { message: 'فشل محاكاة عملية الدفع عبر PayPal.' }
                    }));
                }
                return of(response);
            })
        );
        // --- END MOCK IMPLEMENTATION ---

        // // --- REAL IMPLEMENTATION (Example) ---
        // return this.http.post<PayPalCaptureOrderResponse>(this.captureOrderUrl, { orderID });
        // // --- END REAL IMPLEMENTATION ---
    }
} 