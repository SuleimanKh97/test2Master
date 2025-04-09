import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { AddProductModel } from 'src/app/Models/addProduct.model'; // Temporarily removed import

// Interface for Seller's Order Item View (matches backend DTO)
export interface SellerOrderItemDTO {
    orderItemId: number;
    orderId: number;
    orderDate: string | null;
    orderStatus: string;
    productId: number;
    productName: string;
    quantity: number;
    pricePerItem: number;
    imageUrl: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class SellerProductService {

    private baseUrl = 'https://localhost:7158/Seller'; // Base URL for Seller controller

    constructor(private http: HttpClient) { }

    // --- Methods for Seller Products (existing - using 'any' temporarily) ---
    // Example modification:
    addProduct(product: any): Observable<any> { // Changed AddProductModel to any
        return this.http.post<any>(`${this.baseUrl}/products`, product).pipe(catchError(this.handleError));
    }
    updateProduct(id: string, product: any): Observable<any> { // Changed AddProductModel to any
        return this.http.put<any>(`${this.baseUrl}/products/${id}`, product).pipe(catchError(this.handleError));
    }
    // Assuming getProducts, getProductById, deleteProduct also exist and might need 'any' if they used AddProductModel
    getProducts(): Observable<any[]> { // Assuming return type was related to AddProductModel
        return this.http.get<any[]>(`${this.baseUrl}/products`).pipe(catchError(this.handleError));
    }
    getProductById(id: string): Observable<any> { // Assuming return type was related
        return this.http.get<any>(`${this.baseUrl}/products/${id}`).pipe(catchError(this.handleError));
    }
    deleteProduct(id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/products/${id}`).pipe(catchError(this.handleError));
    }
    // ------------------------------------------------------------------

    // --- Method to get Seller's Order Items --- 
    getMyOrderItems(): Observable<SellerOrderItemDTO[]> {
        const url = `${this.baseUrl}/MyOrderItems`;
        console.log('SellerProductService: Fetching seller order items from:', url);
        return this.http.get<SellerOrderItemDTO[]>(url).pipe(
            catchError(this.handleError)
        );
    }
    // ------------------------------------------

    // --- Method to update Order Status --- 
    updateOrderStatus(orderId: number, newStatus: string): Observable<any> {
        const url = `${this.baseUrl}/orders/${orderId}/status`;
        console.log(`SellerProductService: Updating status for order ${orderId} to ${newStatus}`);
        return this.http.put<any>(url, { NewStatus: newStatus }).pipe(
            catchError(this.handleError)
        );
    }
    // -----------------------------------

    // Simplified Error Handler 
    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('Seller Service Error:', error);
        let errorMessage = 'An unknown error occurred in seller service.'; // Default message

        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            // The backend returned an unsuccessful response code.
            // Try to get message from backend response body
            if (error.error?.message) {
                errorMessage = error.error.message;
            } else if (typeof error.error === 'string' && error.error.length > 0) {
                errorMessage = error.error;
            } else {
                // Fallback to status code if no specific message
                errorMessage = `Server returned code ${error.status}`;
                if (error.message) { // Include HttpErrorResponse message if available
                    errorMessage += `, error: ${error.message}`;
                }
            }
        }
        console.error('Full Backend Error (if available):', error.error); // Log the full body
        return throwError(() => new Error(errorMessage)); // Always return an Error object
    }
} 