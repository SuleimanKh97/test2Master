import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog/blog.service';
import { AdminBlogPostListDTO } from '../../interfaces/blog.interface';

@Component({
  selector: 'app-admin-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-blog-list.component.html',
  styleUrl: './admin-blog-list.component.css'
})
export class AdminBlogListComponent implements OnInit {
  blogPosts: AdminBlogPostListDTO[] = [];
  loading: boolean = true;
  error: string = '';

  private blogService = inject(BlogService);

  ngOnInit(): void {
    this.loadBlogPosts();
  }

  loadBlogPosts(): void {
    this.loading = true;
    this.blogService.getAllBlogPostsForAdmin().subscribe({
      next: (posts) => {
        this.blogPosts = posts;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blog posts. Please try again later.';
        console.error('Error loading blog posts:', err);
        this.loading = false;
      }
    });
  }

  deleteBlogPost(id: number): void {
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      this.blogService.deleteBlogPost(id).subscribe({
        next: () => {
          this.blogPosts = this.blogPosts.filter(post => post.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete blog post. Please try again later.';
          console.error('Error deleting blog post:', err);
        }
      });
    }
  }
}
