import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';

// Placeholder for User model (adjust based on actual User model)
export interface AdminUser {
    id: string | number;
    username: string;
    email: string;
    role: 'Buyer' | 'Seller' | 'Admin' | string; // Allow string for flexibility from backend
    createdAt: Date | string;
    // Add other relevant fields: isActive, orderCount, etc.
}

// Model for adding a user (matches backend RegisterModel, maybe without Role if backend defaults)
export interface AddUserModel {
    username: string;
    email: string;
    password?: string; // Password is required on add
    role: string; // Role is required on add
}

// Model for updating a user (matches backend UpdateUserModel)
export interface UpdateUserModel {
    username: string;
    email: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminUserService {

    // Use the full base path for the admin controller based on user input
    // WARNING: Hardcoding the full URL is not recommended for production.
    // Consider using environment variables or a proxy configuration.
    private apiUrl = 'https://localhost:7158/Admin'; // Updated API URL

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        // Ensure token exists, otherwise API calls might fail silently or with 401
        if (!token) {
            console.error("AdminUserService: Auth token not found in localStorage.");
            // Optionally, redirect to login or handle appropriately
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            // Conditionally add Authorization header only if token exists
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        });
    }

    /** Fetches all users */
    getUsers(): Observable<AdminUser[]> {
        console.log('AdminUserService: Fetching all users from API...');
        // REAL IMPLEMENTATION
        return this.http.get<AdminUser[]>(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Updates a user's details */
    updateUser(userId: string | number, userData: UpdateUserModel): Observable<any> {
        console.log(`AdminUserService: Updating user ${userId} via API...`, userData);
        // REAL IMPLEMENTATION
        return this.http.put(`${this.apiUrl}/users/${userId}`, userData, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Adds a new user */
    // Ensure userData matches the expected structure from the backend (RegisterModel)
    addUser(userData: AddUserModel): Observable<any> {
        console.log('AdminUserService: Adding new user via API...', userData);
        // REAL IMPLEMENTATION
        return this.http.post(`${this.apiUrl}/users`, userData, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Updates a user's role */
    // Note: Consider if this specific endpoint is still needed if general update works
    // Or adjust this to use the ban/unban endpoint if that's the intention
    updateUserRole(userId: string | number, newRole: 'Buyer' | 'Seller' | 'Admin' | string): Observable<any> {
        console.log(`AdminUserService: Updating role for user ${userId} to ${newRole} via API...`);
        // Option 1: Use the general update endpoint
        // You might need to fetch the user first to get other details if PUT requires the full model
        // This implementation assumes PUT /users/{id} can handle partial updates or you send the whole object
        const updateData: UpdateUserModel = { role: newRole, username: '', email: '' }; // Placeholder - needs real data
        // !!! This is problematic as we don't have the current username/email here!
        // !!! It's better to use the main updateUser method from the component which has the full user object
        console.warn('updateUserRole should ideally use the full updateUser method with complete data.');
        // Temporary fallback - might fail if backend expects full model
        // return this.updateUser(userId, updateData);

        // Option 2: If there was a specific role update endpoint (like the ban one)
        // return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role: newRole }, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));

        // Option 3: Remove this method if `updateUser` from component handles role changes
        return throwError(() => new Error('updateUserRole method is deprecated. Use standard updateUser.'));
    }

    /** Deletes a user */
    deleteUser(userId: string | number): Observable<any> {
        console.log(`AdminUserService: Deleting user ${userId} via API...`);
        // REAL IMPLEMENTATION
        return this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    // Basic error handling - improved
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            // Backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            // Try to get message from backend error response
            errorMessage = error.error?.message || error.message || `Server error (status ${error.status})`;
        }
        console.error('API Error:', errorMessage);
        // Return an observable with a user-facing error message
        return throwError(() => new Error(errorMessage));
    }
} 
