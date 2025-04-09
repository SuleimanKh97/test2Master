import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SellerProductService, SellerProduct, AddProductModel } from '../../Services/seller/seller-product.service';
import { AdminCategoryService, Category } from '../../Services/admin/admin-category.service';
import { catchError, finalize, of, Observable, forkJoin } from 'rxjs';

@Component({
    selector: 'app-seller-product-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule // Add ReactiveFormsModule here
    ],
    templateUrl: './seller-product-form.component.html',
    styleUrls: ['./seller-product-form.component.css']
})
export class SellerProductFormComponent implements OnInit {

    productForm!: FormGroup;
    isEditMode = false;
    productId: string | number | null = null;
    isLoading = false;
    submitted = false;
    errorMessage: string | null = null;
    pageTitle = 'إضافة منتج جديد'; // Default title
    availableCategories$: Observable<Category[]> = of([]); // Observable for categories

    constructor(
        private fb: FormBuilder,
        private sellerProductService: SellerProductService,
        private adminCategoryService: AdminCategoryService, // Inject Category service
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.productId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.productId;

        this.initForm();
        this.loadInitialData(); // Load categories and potentially product data
    }

    loadInitialData(): void {
        this.isLoading = true;
        this.errorMessage = null;

        const categoryRequest = this.adminCategoryService.getCategories().pipe(
            catchError(err => {
                console.error('Error loading categories:', err);
                this.errorMessage = 'فشل تحميل قائمة الفئات.';
                return of([]); // Return empty array on category load error
            })
        );

        this.availableCategories$ = categoryRequest; // Assign observable for the template

        if (this.isEditMode && this.productId) {
            this.pageTitle = 'تعديل المنتج';
            const productRequest = this.sellerProductService.getProductById(Number(this.productId)).pipe(
                catchError(err => {
                    console.error('Error loading product data:', err);
                    // Try to use the specific error message from the backend
                    const backendErrorMessage = err?.message || 'فشل تحميل بيانات المنتج.';
                    this.errorMessage = backendErrorMessage;
                    // Append general context if needed
                    // this.errorMessage = `فشل تحميل بيانات المنتج: ${backendErrorMessage}`;
                    return of(null); // Return null on product load error
                })
            );

            // Use forkJoin to wait for both requests if in edit mode
            forkJoin({ categories: categoryRequest, product: productRequest })
                .pipe(finalize(() => this.isLoading = false))
                .subscribe(({ product }) => {
                    if (product) {
                        console.log('Product data received:', product);
                        this.productForm.patchValue(product);
                        console.log('Form values after patchValue:', this.productForm.value);
                    } else {
                        console.error('Product data received is null or undefined');
                    }
                    // Categories are handled by availableCategories$
                });
        } else {
            // Only need categories in add mode
            this.pageTitle = 'إضافة منتج جديد';
            categoryRequest
                .pipe(finalize(() => this.isLoading = false))
                .subscribe(); // Subscribe to trigger the request
        }
    }

    // Initialize the form structure and validators
    initForm(): void {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            price: [null, [Validators.required, Validators.min(0.01)]], // Price must be positive
            categoryId: [null, Validators.required], // Add categoryId field
            img: [''] // Use 'img' to match backend/service interface
        });
    }

    // Convenience getter for easy access to form controls in the template
    get f() { return this.productForm.controls; }

    onSubmit(): void {
        this.submitted = true;
        this.errorMessage = null;

        if (this.productForm.invalid) {
            return; // Stop if the form is invalid
        }

        this.isLoading = true;
        const productData: AddProductModel = {
            name: this.f['name'].value,
            description: this.f['description'].value,
            price: this.f['price'].value,
            categoryId: this.f['categoryId'].value, // Now this exists
            img: this.f['img']?.value || '' // Read from 'img' control
        };

        const saveOperation: Observable<any> = this.isEditMode
            ? this.sellerProductService.updateProduct(Number(this.productId!), productData)
            : this.sellerProductService.addProduct(productData);

        saveOperation.pipe(
            catchError(err => {
                console.error('Error saving product:', err);
                this.errorMessage = err.message || (this.isEditMode ? 'فشل تحديث المنتج.' : 'فشل إضافة المنتج.');
                return of(null); // Indicate error but continue finalize
            }),
            finalize(() => this.isLoading = false)
        ).subscribe(result => {
            if (result) {
                console.log('Product saved successfully:', result);
                // Navigate back to the product list on success
                this.router.navigate(['/seller/products']);
            }
            // Error message is handled in catchError
        });
    }

    // Method to navigate back without saving
    cancel(): void {
        this.router.navigate(['/seller/products']);
    }
} 