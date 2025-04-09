import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminCategoryService, Category, AddCategoryModel } from '../../Services/admin/admin-category.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for template-driven form

@Component({
    selector: 'app-admin-category-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule], // Use FormsModule for ngModel
    providers: [],
    templateUrl: './admin-category-list.component.html',
    styleUrls: ['./admin-category-list.component.css'] // Shares styles
})
export class AdminCategoryListComponent implements OnInit {
    categories$: Observable<Category[]> = of([]);
    isLoading = true;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    // For adding/editing categories inline or via modal (simple inline example)
    showAddForm = false;
    newCategory: AddCategoryModel = { name: '', description: '' }; // Use AddCategoryModel

    constructor(private adminCategoryService: AdminCategoryService) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.isLoading = true;
        this.errorMessage = null;
        this.categories$ = this.adminCategoryService.getCategories().pipe(
            catchError(err => {
                this.errorMessage = err.message || 'Failed to load categories.';
                this.isLoading = false;
                return of([]);
            })
        );
        this.categories$.subscribe({
            next: () => this.isLoading = false,
            error: () => this.isLoading = false
        });
    }

    toggleAddForm(): void {
        this.showAddForm = !this.showAddForm;
        this.newCategory = { name: '', description: '' };
        this.errorMessage = null;
        this.successMessage = null;
    }

    saveNewCategory(): void {
        if (!this.newCategory.name) {
            this.errorMessage = 'اسم الفئة مطلوب.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;
        this.successMessage = null;

        this.adminCategoryService.addCategory(this.newCategory).subscribe({
            next: () => {
                this.successMessage = 'تمت إضافة الفئة بنجاح.';
                this.loadCategories();
                this.toggleAddForm();
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => {
                this.errorMessage = err.message || 'فشل في إضافة الفئة.';
                this.isLoading = false;
            }
        });
    }

    deleteCategory(categoryId: string | number): void {
        if (!confirm('هل أنت متأكد أنك تريد حذف هذه الفئة؟ قد يؤثر هذا على المنتجات المرتبطة بها.')) return;

        this.isLoading = true;
        this.errorMessage = null;
        this.successMessage = null;

        this.adminCategoryService.deleteCategory(categoryId).subscribe({
            next: (res) => {
                this.successMessage = res?.message || 'Category deleted successfully.';
                this.loadCategories();
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => {
                this.errorMessage = err.message || 'فشل في حذف الفئة.';
                this.isLoading = false;
            }
        });
    }
} 