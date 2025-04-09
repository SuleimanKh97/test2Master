import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminCategoryService, Category } from '../../Services/admin/admin-category.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // Import forms modules

@Component({
    selector: 'app-admin-category-list',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
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
    newCategoryName = '';
    newCategoryDescription = '';
    editingCategory: Category | null = null;

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
        this.categories$.subscribe(() => this.isLoading = false);
    }

    toggleAddForm(): void {
        this.showAddForm = !this.showAddForm;
        this.editingCategory = null; // Reset editing state
        this.newCategoryName = '';
        this.newCategoryDescription = '';
    }

    startEditing(category: Category): void {
        this.editingCategory = { ...category }; // Clone to avoid modifying original object directly
        this.showAddForm = false; // Hide add form if it was open
    }

    cancelEditing(): void {
        this.editingCategory = null;
    }

    saveNewCategory(): void {
        if (!this.newCategoryName) return;
        const categoryData = { name: this.newCategoryName, description: this.newCategoryDescription };
        this.adminCategoryService.addCategory(categoryData).subscribe({
            next: () => {
                this.successMessage = 'Category added successfully.';
                this.loadCategories();
                this.toggleAddForm(); // Hide form
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => this.errorMessage = err.message || 'Failed to add category.'
        });
    }

    saveEditedCategory(): void {
        if (!this.editingCategory || !this.editingCategory.name) return;
        this.adminCategoryService.updateCategory(this.editingCategory.id, this.editingCategory).subscribe({
            next: () => {
                this.successMessage = 'Category updated successfully.';
                this.loadCategories();
                this.editingCategory = null; // Exit editing mode
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => this.errorMessage = err.message || 'Failed to update category.'
        });
    }

    deleteCategory(categoryId: string | number): void {
        if (!confirm('Are you sure you want to delete this category?')) return;

        this.adminCategoryService.deleteCategory(categoryId).subscribe({
            next: (res) => {
                this.successMessage = res.message || 'Category deleted successfully.';
                this.loadCategories(); // Refresh list
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => this.errorMessage = err.message || 'Failed to delete category.'
        });
    }
} 