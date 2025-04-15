// src/app/Interfaces/blog.interface.ts

export interface BlogPostSummaryDTO {
    id: number;
    title: string;
    summary: string;
    imageUrl?: string;
    authorName: string;
    createdAt: Date;
}

export interface BlogPostDetailDTO {
    id: number;
    title: string;
    content: string;
    imageUrl?: string;
    authorName: string;
    createdAt: Date;
    updatedAt?: Date;
}

// DTO for admin listing
export interface AdminBlogPostListDTO {
    id: number;
    title: string;
    createdAt: Date;
    updatedAt?: Date;
    isPublished: boolean;
    authorName: string;
}

// DTOs for creating/updating posts
export interface CreateBlogPostDTO {
    title: string;
    content: string;
    imageUrl?: string;
    isPublished: boolean;
}

export interface UpdateBlogPostDTO {
    title?: string;
    content?: string;
    imageUrl?: string;
    isPublished?: boolean;
}