import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

// Placeholder for Category model
export interface Category {
    id: string | number;
    name: string;
    description?: string;
    // Add other fields: parentCategoryId, imageUrl etc.
}

@Injectable({
    providedIn: 'root'
})
export class AdminCategoryService {

    private apiUrl = '/api/admin/categories'; // Example API endpoint
    private mockCategories: Category[] = [
        { id: 'c1', name: 'مواشي', description: 'الأغنام والماعز والأبقار' },
        { id: 'c2', name: 'أعلاف', description: 'أعلاف للمواشي' },
        { id: 'c3', name: 'معدات', description: 'معدات وأدوات للمزارعين' }
    ];
    private nextId = 4;

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    /** Fetches all categories */
    getCategories(): Observable<Category[]> {
        console.log('AdminCategoryService: Fetching all categories (mock)...');
        // --- MOCK IMPLEMENTATION ---
        return of([...this.mockCategories]).pipe(delay(600));
        // --- END MOCK ---
        // // REAL: return this.http.get<Category[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    /** Adds a new category */
    addCategory(categoryData: Omit<Category, 'id'>): Observable<Category> {
        console.log('AdminCategoryService: Adding category (mock)...', categoryData);
        // --- MOCK IMPLEMENTATION ---
        if (!categoryData.name) return throwError(() => ({ status: 400, message: 'Category name is required (mock)' })).pipe(delay(400));
        const newCategory = { ...categoryData, id: `c${this.nextId++}` };
        this.mockCategories.push(newCategory);
        return of(newCategory).pipe(delay(700));
        // --- END MOCK ---
        // // REAL: return this.http.post<Category>(this.apiUrl, categoryData, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    /** Updates a category */
    updateCategory(categoryId: string | number, categoryData: Category): Observable<any> {
        console.log(`AdminCategoryService: Updating category ${categoryId} (mock)...`, categoryData);
        // --- MOCK IMPLEMENTATION ---
        const index = this.mockCategories.findIndex(c => c.id == categoryId);
        if (index === -1) return throwError(() => ({ status: 404, message: 'Category not found (mock)' })).pipe(delay(400));
        this.mockCategories[index] = { ...categoryData, id: categoryId };
        return of({ message: 'Category updated successfully (mock)' }).pipe(delay(600));
        // --- END MOCK ---
        // // REAL: return this.http.put(`${this.apiUrl}/${categoryId}`, categoryData, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    /** Deletes a category */
    deleteCategory(categoryId: string | number): Observable<any> {
        console.log(`AdminCategoryService: Deleting category ${categoryId} (mock)...`);
        // --- MOCK IMPLEMENTATION ---
        const initialLength = this.mockCategories.length;
        this.mockCategories = this.mockCategories.filter(c => c.id != categoryId);
        if (initialLength === this.mockCategories.length) return throwError(() => ({ status: 404, message: 'Category not found (mock)' })).pipe(delay(400));
        return of({ message: 'Category deleted successfully (mock)' }).pipe(delay(500));
        // --- END MOCK ---
        // // REAL: return this.http.delete(`${this.apiUrl}/${categoryId}`, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));
    }

    // Basic error handling
    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        let errorMessage = error.error?.message || error.message || 'An unknown error occurred!';
        return throwError(() => new Error(errorMessage));
    }
} 