import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface for the dashboard statistics returned by the API
export interface SellerDashboardStats {
    totalProducts: number;
    totalOrders: number; // Or related metric like totalOrderItemsSold
    totalRevenue: number;
    // Add other stats if the backend provides them
}

@Injectable({
    providedIn: 'root'
})
export class SellerDashboardService {

    // Use the full base path for the Seller controller
    // WARNING: Hardcoding URL is not ideal. Use proxy or environment variables.
    private apiUrl = 'https://localhost:7158/Seller'; // Assuming SellerController path

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("SellerDashboardService: Auth token not found in localStorage.");
            // Handle missing token case - maybe throw error or return empty observable
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        });
    }

    /** Fetches dashboard statistics for the logged-in seller */
    getDashboardStats(): Observable<SellerDashboardStats> {
        console.log('SellerDashboardService: Fetching dashboard stats from API...');
        return this.http.get<SellerDashboardStats>(`${this.apiUrl}/dashboard`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    // Shared error handler
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = error.error?.message || `Server error (status ${error.status})`;
        }
        console.error('Seller API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}