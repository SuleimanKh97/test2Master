import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GeminiRequestBody, GeminiResponse } from '../../Interfaces/chatbot.interface';

@Injectable({
    providedIn: 'root'
})
export class ChatbotService {

    // !!! WARNING: DO NOT USE HARDCODED API KEYS IN PRODUCTION !!!
    private apiKey = 'AIzaSyBjyvbUHTBqhjuISGtWHHx50MQti13RZiM'; // MOVE TO BACKEND/ENV VARS!

    // Remove API key from the URL
    private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    constructor(private http: HttpClient) { }

    generateContent(prompt: string): Observable<GeminiResponse> {
        const requestBody: GeminiRequestBody = {
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
            // Add generationConfig or safetySettings here if needed
            // generationConfig: {
            //   temperature: 0.7
            // }
        };

        // Add API key to the headers
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',

        });

        console.log('Sending request to Gemini:', requestBody);

        // Include key parameter in the URL - keep this for now based on the original request
        const urlWithKey = `${this.apiUrl}?key=${this.apiKey}`;

        return this.http.post<GeminiResponse>(urlWithKey, requestBody, { headers }).pipe(
            map(response => {
                console.log('Received response from Gemini:', response);
                // Basic validation/check
                if (!response || (!response.candidates && !response.promptFeedback)) {
                    console.error('Invalid response structure from Gemini:', response);
                    throw new Error('Received an invalid response from the chatbot API.');
                }

                // Check for safety issues indicated in promptFeedback (optional, but good practice)
                if (response.promptFeedback?.safetyRatings?.some(rating => rating.probability !== 'NEGLIGIBLE' && rating.probability !== 'LOW')) {
                    console.warn('Potential safety issue detected in prompt feedback:', response.promptFeedback);
                    // Decide if you want to throw an error here or just rely on finishReason check below
                    // throw new Error('Your prompt may have triggered safety concerns.');
                }

                // Check if the response candidate itself was blocked or empty
                // (Handles cases where the prompt was okay but the *response* was blocked)
                if (!response.candidates || response.candidates.length === 0) {
                    console.warn('No candidates received from Gemini:', response);
                    throw new Error('No response content received from the chatbot.');
                }

                // Check finishReason for explicit blocking
                const finishReason = response.candidates[0].finishReason;
                if (finishReason === 'SAFETY') {
                    console.warn('Response blocked due to safety settings.');
                    throw new Error('The response was blocked due to safety concerns.');
                }
                if (finishReason === 'RECITATION') {
                    console.warn('Response blocked due to recitation.');
                    throw new Error('The response was blocked due to potential recitation issues.');
                }
                if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
                    console.warn(`Unexpected finish reason: ${finishReason}`);
                    // Handle other potential finish reasons if needed
                }

                // Check if parts array exists and is not empty
                if (!response.candidates[0].content?.parts || response.candidates[0].content.parts.length === 0) {
                    console.warn('Received candidate with no content parts:', response.candidates[0]);
                    throw new Error('Received an empty response from the chatbot.');
                }

                return response;
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Chatbot API error:', error);
        let userMessage = 'An error occurred while contacting the chatbot.';
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            userMessage = `Network error: ${error.error.message}`;
        } else {
            // Backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            userMessage = `Chatbot service error: ${error.status} - ${error.statusText}. `;
            if (error.error && error.error.error && error.error.error.message) {
                userMessage += error.error.error.message;
            } else if (typeof error.error === 'string') {
                userMessage += error.error;
            }
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error(userMessage));
    }
}
