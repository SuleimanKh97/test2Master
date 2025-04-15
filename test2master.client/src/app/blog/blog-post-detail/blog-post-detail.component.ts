import { Component, OnInit, inject, SecurityContext } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BlogService } from '../../services/blog/blog.service';
import { BlogPostDetailDTO } from '../../interfaces/blog.interface';

@Component({
  selector: 'app-blog-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-post-detail.component.html',
  styleUrls: ['./blog-post-detail.component.css']
})
export class BlogPostDetailComponent implements OnInit {
  post$: Observable<BlogPostDetailDTO | null> | undefined;
  postContentSanitized: SafeHtml | null = null;

  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);

  ngOnInit(): void {
    this.post$ = this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        if (idParam) {
          const id = +idParam;
          return this.blogService.getBlogPost(id);
        }
        return of(null);
      })
    );

    this.post$.subscribe(post => {
      if (post) {
        this.titleService.setTitle(`${post.title} - مدونة سوق الحلال`);
        this.postContentSanitized = this.sanitizer.bypassSecurityTrustHtml(post.content);
        console.log("Post content sanitized.");
      } else {
        this.titleService.setTitle('المقال غير موجود - مدونة سوق الحلال');
        console.log("Post not found or ID invalid.");
      }
    });
  }
}
