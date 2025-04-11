import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { BlogService } from '../../Services/blog/blog.service'; // Verify path
import { BlogPostSummaryDTO } from '../../Interfaces/blog.interface'; // Verify path

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
    // Fetch all posts (or a large number for now)
    // Consider adding pagination to the service and component later
    this.allPosts$ = this.blogService.getBlogPosts(100); // Fetch up to 100 posts
  }
}
