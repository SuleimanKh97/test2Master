import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';

// Placeholder for User model (adjust based on actual User model)
export interface AdminUser {
    id: string | number;
    username: string;
    email: string;
    role: 'Buyer' | 'Seller' | 'Admin';
    createdAt: Date | string;
    // Add other relevant fields: isActive, orderCount, etc.
}

@Injectable({
    providedIn: 'root'
})
export class AdminUserService {

    private apiUrl = '/api/admin/users'; // Example API endpoint
    // Mock data store
    private mockUsers: AdminUser[] = [
        { id: 'u1', username: 'buyer1', email: 'buyer1@test.com', role: 'Buyer', createdAt: new Date(Date.now() - 86400000 * 3) },
        { id: 'u2', username: 'seller', email: 'seller@test.com', role: 'Seller', createdAt: new Date(Date.now() - 86400000 * 2) },
        { id: 'u3', username: 'buyer2', email: 'buyer2@test.com', role: 'Buyer', createdAt: new Date(Date.now() - 86400000 * 1) },
        { id: 'u4', username: 'admin', email: 'admin@test.com', role: 'Admin', createdAt: new Date() },
    ];


    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    /** Fetches all users */
    getUsers(): Observable<AdminUser[]> {
        console.log('AdminUserService: Fetching all users (mock)...');
        // --- MOCK IMPLEMENTATION ---
        // Return a copy to prevent direct modification of the mock store
        return of([...this.mockUsers]).pipe(delay(500)); // Simulate network delay
        // --- END MOCK ---
        // // REAL: return this.http.get<AdminUser[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    /** Updates a user's details */
    updateUser(userId: string | number, userData: Partial<AdminUser>): Observable<any> {
        console.log(`AdminUserService: Updating user ${userId} (mock)...`, userData);
        // --- MOCK IMPLEMENTATION ---
        const userIndex = this.mockUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            // Update the user in the mock store
            this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...userData };
            console.log('Mock store updated:', this.mockUsers);
            // Simulate success or failure randomly
            if (Math.random() < 0.1) { // 10% chance of failure
                console.error(`Mock Failure: Could not update user ${userId}`);
                return throwError(() => ({ status: 500, message: 'Failed to update user (mock)' })).pipe(delay(600));
            }
            return of({ message: 'User updated successfully (mock)' }).pipe(delay(600));
        } else {
            console.error(`Mock Error: User ${userId} not found.`);
            return throwError(() => ({ status: 404, message: 'User not found (mock)' })).pipe(delay(600));
        }
        // --- END MOCK ---
        // // REAL: return this.http.put(`${this.apiUrl}/${userId}`, userData, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }


    /** Updates a user's role */
    updateUserRole(userId: string | number, newRole: 'Buyer' | 'Seller' | 'Admin'): Observable<any> {
        console.log(`AdminUserService: Updating role for user ${userId} to ${newRole} (mock)...`);
        // --- MOCK IMPLEMENTATION ---
        // Delegate to the main updateUser method for mock consistency
        return this.updateUser(userId, { role: newRole });
        // --- END MOCK ---
        // // REAL: return this.http.put(`${this.apiUrl}/${userId}/role`, { role: newRole }, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    /** Deletes a user */
    deleteUser(userId: string | number): Observable<any> {
        console.log(`AdminUserService: Deleting user ${userId} (mock)...`);
        // --- MOCK IMPLEMENTATION ---
        const userIndex = this.mockUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            this.mockUsers.splice(userIndex, 1); // Remove from mock store
            console.log('Mock store updated:', this.mockUsers);
            // Simulate success or failure randomly
            if (Math.random() < 0.05) { // 5% chance of failure
                console.error(`Mock Failure: Could not delete user ${userId}`);
                // Re-add user if deletion fails simulation? Depends on desired mock behavior.
                return throwError(() => ({ status: 500, message: 'Failed to delete user (mock)' })).pipe(delay(500));
            }
            return of({ message: 'User deleted successfully (mock)' }).pipe(delay(700));
        } else {
            console.error(`Mock Error: User ${userId} not found for deletion.`);
            return throwError(() => ({ status: 404, message: 'User not found for deletion (mock)' })).pipe(delay(500));
        }
        // --- END MOCK ---
        // // REAL: return this.http.delete(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    // Basic error handling
    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        // Try to get message from backend error response, fallback to generic message
        let errorMessage = error.error?.message || error.message || 'An unknown error occurred!';
        return throwError(() => new Error(errorMessage));
    }
} 