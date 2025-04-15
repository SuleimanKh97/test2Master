import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface matching the backend CreateFeedbackDto
export interface CreateFeedbackDto {
    productId: number; // Use number if ProductId is number in Angular models
    rating: number;
    comment?: string | null;
}

// Interface for the expected success response (optional but good practice)
export interface FeedbackSubmissionResponse {
    message: string;
    feedbackId?: number;
    feedback?: any; // Or a more specific interface if needed
}

@Injectable({
    providedIn: 'root'
})
export class FeedbackService {

    private apiUrl = '/api/feedback'; // Adjust if your API prefix is different

    constructor(private http: HttpClient) { }

    submitFeedback(feedbackData: CreateFeedbackDto): Observable<FeedbackSubmissionResponse> {
        // Headers are likely needed for auth token which is handled by interceptor
        // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        return this.http.post<FeedbackSubmissionResponse>(this.apiUrl, feedbackData /*, { headers }*/)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Feedback API error:', error);

        let userMessage = 'An error occurred while submitting feedback.';
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            userMessage = `Network error: ${error.error.message}`;
        } else {
            // Backend returned an unsuccessful response code.
            if (error.status === 400 && error.error && typeof error.error.message === 'string') {
                userMessage = `Submission failed: ${error.error.message}`; // Use backend message if available
            } else if (error.status === 401 || error.status === 403) {
                userMessage = 'Authentication error. Please ensure you are logged in.';
            } else if (error.status === 404) {
                userMessage = 'Could not find the specified product.';
            } else {
                userMessage = `Server error: ${error.status} - ${error.statusText}. Please try again later.`;
            }
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error(userMessage));
    }
}


