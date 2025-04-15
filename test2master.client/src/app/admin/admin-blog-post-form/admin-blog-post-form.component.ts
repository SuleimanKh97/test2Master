import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog/blog.service';
import { CreateBlogPostDTO, UpdateBlogPostDTO } from '../../interfaces/blog.interface';

@Component({
  selector: 'app-admin-blog-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-blog-post-form.component.html',
  styleUrl: './admin-blog-post-form.component.css'
})
export class AdminBlogPostFormComponent implements OnInit {
  blogForm!: FormGroup;
  isEditMode: boolean = false;
  blogPostId?: number;
  loading: boolean = false;
  submitting: boolean = false;
  error: string = '';
  successMessage: string = '';

  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.initForm();
    this.checkIfEditMode();
  }

  initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      content: ['', [Validators.required]],
      imageUrl: [''],
      isPublished: [true]
    });
  }

  checkIfEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.blogPostId = +id;
      this.loadBlogPostData(this.blogPostId);
    }
  }

  loadBlogPostData(id: number): void {
    this.loading = true;
    this.blogService.getBlogPostForAdmin(id).subscribe({
      next: (post) => {
        this.blogForm.patchValue({
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl,
          isPublished: true // We need to fetch isPublished value from admin API
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blog post data. Please try again later.';
        console.error('Error loading blog post:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    const formData = this.blogForm.value;

    if (this.isEditMode && this.blogPostId) {
      // Update existing post
      const updateData: UpdateBlogPostDTO = {
        title: formData.title,
        content: formData.content,
        imageUrl: formData.imageUrl,
        isPublished: formData.isPublished
      };

      this.blogService.updateBlogPost(this.blogPostId, updateData).subscribe({
        next: () => {
          this.successMessage = 'تم تحديث المقال بنجاح!';
          this.submitting = false;
          setTimeout(() => {
            this.router.navigate(['/admin/blog']);
          }, 1500);
        },
        error: (err) => {
          this.error = 'فشل تحديث المقال. يرجى المحاولة مرة أخرى.';
          console.error('Error updating blog post:', err);
          this.submitting = false;
        }
      });
    } else {
      // Create new post
      const createData: CreateBlogPostDTO = {
        title: formData.title,
        content: formData.content,
        imageUrl: formData.imageUrl,
        isPublished: formData.isPublished
      };

      this.blogService.createBlogPost(createData).subscribe({
        next: () => {
          this.successMessage = 'تم إنشاء المقال بنجاح!';
          this.submitting = false;
          setTimeout(() => {
            this.router.navigate(['/admin/blog']);
          }, 1500);
        },
        error: (err) => {
          this.error = 'فشل إنشاء المقال. يرجى المحاولة مرة أخرى.';
          console.error('Error creating blog post:', err);
          this.submitting = false;
        }
      });
    }
  }
}
