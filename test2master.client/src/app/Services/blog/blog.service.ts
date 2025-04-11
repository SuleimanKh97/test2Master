// src/app/Services/blog/blog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BlogPostSummaryDTO, BlogPostDetailDTO, CreateBlogPostDTO, UpdateBlogPostDTO, AdminBlogPostListDTO } from '../../Interfaces/blog.interface'; // Path should be correct now
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private baseApiUrl = 'https://localhost:7158/api'; // Adjust port if necessary
  private blogApiUrl = `${this.baseApiUrl}/blog`;
  private adminBlogApiUrl = `${this.baseApiUrl}/Admin/blogposts`;

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

  getBlogPosts(count: number = 100): Observable<BlogPostSummaryDTO[]> {
    let params = new HttpParams().set('count', count.toString());
    return this.http.get<BlogPostSummaryDTO[]>(this.blogApiUrl, { params });
  }

  getBlogPost(id: number): Observable<BlogPostDetailDTO> {
    return this.http.get<BlogPostDetailDTO>(`${this.blogApiUrl}/${id}`);
  }

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

  createBlogPost(postData: CreateBlogPostDTO): Observable<BlogPostDetailDTO> {
    const headers = this.getAuthHeaders();
    if (!headers) return of({} as BlogPostDetailDTO);
    return this.http.post<BlogPostDetailDTO>(this.adminBlogApiUrl, postData, { headers });
  }

  updateBlogPost(id: number, postData: UpdateBlogPostDTO): Observable<void> {
    const headers = this.getAuthHeaders();
    if (!headers) return new Observable<void>(obs => { obs.error('Not authenticated'); obs.complete(); });
    return this.http.put<void>(`${this.adminBlogApiUrl}/${id}`, postData, { headers });
  }

  deleteBlogPost(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    if (!headers) return new Observable<void>(obs => { obs.error('Not authenticated'); obs.complete(); });
    return this.http.delete<void>(`${this.adminBlogApiUrl}/${id}`, { headers });
  }
}