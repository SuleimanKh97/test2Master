import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Placeholder for Category model
export interface Category {
    id: string | number;
    name: string;
    description?: string;
    // Add other fields: parentCategoryId, imageUrl etc.
}

// Interface for adding a category (matching backend CreateCategoryRequest)
export interface AddCategoryModel {
    name: string;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminCategoryService {

    // Use the full base path for the Category controller
    private apiUrl = 'https://localhost:7158/Category'; // Updated API URL for Category Controller

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        // Admin operations on categories likely require auth
        if (!token) {
            console.error("AdminCategoryService: Auth token not found in localStorage.");
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        });
    }

    /** Fetches all categories */
    getCategories(): Observable<Category[]> {
        console.log('AdminCategoryService: Fetching all categories from API...');
        // REAL IMPLEMENTATION
        return this.http.get<Category[]>(`${this.apiUrl}/ListCategory`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Adds a new category */
    addCategory(categoryData: AddCategoryModel): Observable<Category> { // Expect AddCategoryModel
        console.log('AdminCategoryService: Adding category via API...', categoryData);
        // REAL IMPLEMENTATION
        return this.http.post<Category>(this.apiUrl, categoryData, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Deletes a category */
    deleteCategory(categoryId: string | number): Observable<any> {
        console.log(`AdminCategoryService: Deleting category ${categoryId} via API...`);
        // REAL IMPLEMENTATION
        return this.http.delete(`${this.apiUrl}/${categoryId}`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    // Improved error handling
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = error.error?.message || error.message || `Server error (status ${error.status})`;
        }
        console.error('API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
} 