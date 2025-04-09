import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';



@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://localhost:7158/auth'; // غيّرها حسب رابط الباك
  private tokenKey = 'token';

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) this.currentUserSubject.next(JSON.parse(savedUser));
  }

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        if (res?.token) {
          this.setToken(res.token);
          localStorage.setItem('user', JSON.stringify(res));
          if (res.userId) { 
            localStorage.setItem('userId', res.userId);
            console.log('Stored userId:', res.userId);
          } else {
            console.warn('userId not found in login response.');
          }
          this.currentUserSubject.next(res);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/currentUser`);
  }

  updateProfile(updateData: { newUsername?: string; newEmail?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, updateData).pipe(
      tap((response: any) => {
        console.log("Profile update response:", response);
        if(this.currentUserSubject.value && response?.updatedUser) {
          const updatedLocalUser = { 
            ...this.currentUserSubject.value, 
            username: response.updatedUser.username, 
            email: response.updatedUser.email 
          };
          localStorage.setItem('user', JSON.stringify(updatedLocalUser));
          this.currentUserSubject.next(updatedLocalUser);
        }
      })
    );
  }

  // Method to change password
  changePassword(passwordData: { currentPassword?: string; newPassword?: string }): Observable<any> {
    // Assumes TokenInterceptor adds the auth header
    return this.http.put(`${this.apiUrl}/change-password`, passwordData);
  }

}

//  private baseUrl = 'https://localhost:7084/auth'; // غيّر الرابط حسب السيرفر
//  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
//  private userRoleSubject = new BehaviorSubject<string | null>(this.getRole());

//  constructor(private http: HttpClient, private router: Router) {



//    //const savedUser = localStorage.getItem('user');
//    //if (savedUser) {
//    //  this.currentUserSubject.next(JSON.parse(savedUser));
//    //}
//  }
  
//  login(data: { username: string; password: string }): Observable<any> {
//    return this.http.post(`${this.apiUrl}/login`, data).pipe(
//      map((res: any) => {
//        localStorage.setItem('token', res.token);
//        localStorage.setItem('user', JSON.stringify(res));
//        this.currentUserSubject.next(res);
//        return res;
//      })
//    );
//  }

//  //login(email: string, password: string): Observable<User> {
//  //  return this.http.post<User>('/api/auth/login', { email, password }).pipe(
//  //    tap(user => {
//  //      localStorage.setItem('user', JSON.stringify(user));
//  //      this.currentUserSubject.next(user);
//  //    })
//  //  );
//  //}

//  register(data: any): Observable<any> {
//    return this.http.post(`${this.baseUrl}/register`, data);
//  }

//  //register(data: RegisterPayload): Observable<any> {
//  //  return this.http.post(`${this.apiUrl}/register`, data);
//  //}

//  //logout(): void {
//  //  localStorage.removeItem('user');
//  //  this.currentUserSubject.next(null);
//  //  this.router.navigate(['/login']);
//  //}
//  logout(): void {
//    localStorage.clear();
//    this.isLoggedInSubject.next(false);
//    this.userRoleSubject.next(null);
//  }

//  isAuthenticated(): Observable<boolean> {
//    return this.isLoggedInSubject.asObservable();
//  }

//  getUserRole(): Observable<string | null> {
//    return this.userRoleSubject.asObservable();
//  }

//  getCurrentUser(): Observable<any> {
//    return this.http.get(`${this.baseUrl}/currentUser`);
//  }

//  private hasToken(): boolean {
//    return !!localStorage.getItem('token');
//  }

//  private getRole(): string | null {
//    return localStorage.getItem('role');
//  }
//}

//  //redirectUserByRole(role: string) {
//  //  switch (role) {
//  //    case 'admin':
//  //      this.router.navigate(['/admin/dashboard']);
//  //      break;
//  //    case 'seller':
//  //      this.router.navigate(['/seller/dashboard']);
//  //      break;
//  //    default:
//  //      this.router.navigate(['/']);
//  //  }
//  //}

//  //get currentUser(): User | null {
//  //  return this.currentUserSubject.value;
//  //}

//  //getCurrentUser(): User | null {
//  //  if (!this.currentUser) {
//  //    const storedUser = localStorage.getItem('user');
//  //    if (storedUser) {
//  //      this.currentUser = JSON.parse(storedUser);
//  //    }
//  //  }
//  //  return this.currentUser;
//  //}

//  //isAuthenticated(): boolean {
//  //  return !!localStorage.getItem('token');
//  //}

//  //getUserRole(): string | null {
//  //  const userData = localStorage.getItem('user');
//  //  if (userData) {
//  //    const user = JSON.parse(userData);
//  //    return user.role;
//  //  }
//  //  return null;
//  //}




