import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SellerProductService, SellerProduct } from '../../Services/seller/seller-product.service';
import { catchError, finalize, of } from 'rxjs';

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

    constructor(
        private fb: FormBuilder,
        private sellerProductService: SellerProductService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.productId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.productId; // Set edit mode if ID exists

        this.initForm();

        if (this.isEditMode) {
            this.pageTitle = 'تعديل المنتج';
            this.loadProductData();
        }
    }

    // Initialize the form structure and validators
    initForm(): void {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            price: [null, [Validators.required, Validators.min(0.01)]], // Price must be positive
            stockQuantity: [null, [Validators.required, Validators.min(0)]], // Stock cannot be negative
            imageUrl: [''] // Optional
            // Add other fields like category here if needed
        });
    }

    // Load product data for editing
    loadProductData(): void {
        if (!this.productId) return;
        this.isLoading = true;
        this.sellerProductService.getProductById(this.productId).pipe(
            catchError(err => {
                console.error('Error loading product data:', err);
                this.errorMessage = 'حدث خطأ أثناء تحميل بيانات المنتج.';
                this.isLoading = false;
                return of(null); // Return null or empty object on error
            }),
            finalize(() => this.isLoading = false)
        ).subscribe(product => {
            if (product) {
                this.productForm.patchValue(product);
            }
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
        const productData: SellerProduct = this.productForm.value;

        const saveOperation = this.isEditMode
            ? this.sellerProductService.updateProduct(this.productId!, productData)
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