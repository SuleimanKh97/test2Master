import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { BlogService } from '../../services/blog/blog.service';
import { BlogPostSummaryDTO } from '../../interfaces/blog.interface';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  allPosts$: Observable<BlogPostSummaryDTO[]> | undefined;

  private blogService = inject(BlogService);
  private titleService = inject(Title);

  ngOnInit(): void {
    this.titleService.setTitle('المدونة - سوق الحلال');
    // Fetch all posts
    this.allPosts$ = this.blogService.getBlogPosts();
  }
}
