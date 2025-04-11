// src/app/Interfaces/blog.interface.ts

export interface BlogPostSummaryDTO {
    id: number;
    title: string;
    publishedDate: Date;
    imageUrl?: string;
    authorName: string;
    excerpt?: string;
  }
  
  export interface BlogPostDetailDTO {
    id: number;
    title: string;
    content: string; // Full content
    publishedDate: Date;
    imageUrl?: string;
    authorName: string;
  }
  
  // DTO for admin listing
  export interface AdminBlogPostListDTO {
      id: number;
      title: string;
      publishedDate: Date;
      authorName: string;
  }
  
  // DTOs for creating/updating posts
  export interface CreateBlogPostDTO {
      title: string;
      content: string;
      imageUrl?: string;
  }
  
  export interface UpdateBlogPostDTO {
      title: string;
      content: string;
      imageUrl?: string;
  }