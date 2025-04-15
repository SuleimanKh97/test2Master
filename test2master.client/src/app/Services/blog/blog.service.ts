// src/app/services/blog/blog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BlogPostSummaryDTO, BlogPostDetailDTO, CreateBlogPostDTO, UpdateBlogPostDTO, AdminBlogPostListDTO } from '../../interfaces/blog.interface';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private baseUrl = 'https://localhost:7158'; // *** Corrected Port ***
  private blogApiUrl = `${this.baseUrl}/Blog`;
  private adminBlogApiUrl = `${this.baseUrl}/Admin/blog`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders | null {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Auth token not found for admin operation.');
      return null;
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getBlogPosts(): Observable<BlogPostSummaryDTO[]> {
    return this.http.get<BlogPostSummaryDTO[]>(this.blogApiUrl);
  }

  getLatestBlogPosts(count: number = 3): Observable<BlogPostSummaryDTO[]> {
    return this.http.get<BlogPostSummaryDTO[]>(`${this.blogApiUrl}/latest/${count}`);
  }

  getBlogPost(id: number): Observable<BlogPostDetailDTO> {
    return this.http.get<BlogPostDetailDTO>(`${this.blogApiUrl}/${id}`);
  }

  // Admin methods
  getAllBlogPostsForAdmin(): Observable<AdminBlogPostListDTO[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return of([]);
    return this.http.get<AdminBlogPostListDTO[]>(this.adminBlogApiUrl, { headers });
  }

  getBlogPostForAdmin(id: number): Observable<BlogPostDetailDTO> {
    const headers = this.getAuthHeaders();
    if (!headers) return of({} as BlogPostDetailDTO);
    return this.http.get<BlogPostDetailDTO>(`${this.adminBlogApiUrl}/${id}`, { headers });
  }

  createBlogPost(postData: CreateBlogPostDTO): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) return of({});
    return this.http.post<any>(this.adminBlogApiUrl, postData, { headers });
  }

  updateBlogPost(id: number, postData: UpdateBlogPostDTO): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) return of({});
    return this.http.put<any>(`${this.adminBlogApiUrl}/${id}`, postData, { headers });
  }

  deleteBlogPost(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) return of({});
    return this.http.delete<any>(`${this.adminBlogApiUrl}/${id}`, { headers });
  }
}