import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
// No need to import AuthService here if we read directly from localStorage

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  // No need to inject AuthService if reading directly from localStorage
  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip adding token for login and register requests
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      return next.handle(request);
    }

    // Get token directly from localStorage using the key 'token'
    const authToken = localStorage.getItem('token');

    if (authToken) {
      const authReq = request.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` }
      });
      return next.handle(authReq);
    }

    return next.handle(request);
  }
}
