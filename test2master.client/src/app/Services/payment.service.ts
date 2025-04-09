import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface InitiatePaymentResponse {
    simulationUrl: string;
}

interface ConfirmPaymentResponse {
    message: string;
    orderId: number;
    finalStatus: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private baseUrl = 'https://localhost:7158/Payment'; // Hardcoded URL

    constructor(private http: HttpClient) { }

    /**
     * Calls the backend to initiate the payment simulation process for an order.
     * @param orderId The ID of the order to start payment simulation for.
     * @returns Observable containing the simulation URL.
     */
    initiatePaymentSimulation(orderId: number): Observable<InitiatePaymentResponse> {
        console.log(`Initiating payment simulation for order ${orderId}`);
        return this.http.post<InitiatePaymentResponse>(`${this.baseUrl}/InitiateSimulation`, { orderId })
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Calls the backend to confirm the outcome of the simulated payment.
     * @param orderId The ID of the order.
     * @param success Whether the simulated payment was successful.
     * @param paymentMethod The payment method used in the simulation.
     * @returns Observable containing the confirmation result.
     */
    confirmPaymentSimulation(orderId: number, success: boolean, paymentMethod: string): Observable<ConfirmPaymentResponse> {
        console.log(`Confirming payment simulation for order ${orderId}, Success: ${success}, Method: ${paymentMethod}`);
        const payload = { orderId, success, paymentMethod };
        return this.http.post<ConfirmPaymentResponse>(`${this.baseUrl}/ConfirmSimulation`, payload)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Payment Service Error:', error);
        let errorMessage = 'An unknown error occurred during payment processing!';
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            errorMessage = `An error occurred: ${error.error.message}`;
        } else {
            // Backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            if (error.error && typeof error.error === 'object' && error.error.message) {
                errorMessage = error.error.message; // Use backend message if available
            } else if (error.statusText && error.status !== 0) {
                errorMessage = `Server error: ${error.status} - ${error.statusText}`;
            } else if (error.status === 0) {
                errorMessage = 'Could not connect to the server. Please check your network connection.';
            }
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error(errorMessage));
    }
} 