import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FeedbackService, CreateFeedbackDto, FeedbackSubmissionResponse } from '../../Services/feedback/feedback.service';
import { ToastrService } from 'ngx-toastr'; // Assuming you use ngx-toastr for notifications

// Interface for product data passed to the modal
export interface ProductToReview {
  id: number;
  name: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // Import necessary modules
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.css']
})
export class FeedbackModalComponent implements OnInit {
  @Input() productsToReview: ProductToReview[] = [];
  @Input() isVisible: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() feedbackSubmitted = new EventEmitter<number>(); // Emit product ID on successful submission

  feedbackForm!: FormGroup;
  isLoading: boolean = false;
  generalError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private toastr: ToastrService // Inject ToastrService
  ) { }

  ngOnInit(): void {
    this.feedbackForm = this.fb.group({
      feedbacks: this.fb.array([])
    });
    this.buildFeedbackForms();
  }

  // Build form controls for each product when products are set
  ngOnChanges(): void {
    if (this.productsToReview && this.productsToReview.length > 0) {
      this.buildFeedbackForms();
    }
  }

  get feedbackControls() {
    return (this.feedbackForm.get('feedbacks') as FormArray).controls as FormGroup[];
  }

  buildFeedbackForms(): void {
    const feedbackArray = this.feedbackForm.get('feedbacks') as FormArray;
    feedbackArray.clear(); // Clear existing controls first

    this.productsToReview.forEach(product => {
      feedbackArray.push(this.fb.group({
        productId: [product.id],
        rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
        comment: [''],
        submitted: [false], // Track if feedback for this product was submitted
        submitError: [null] // Track errors for individual submissions
      }));
    });
  }


  setRating(productIndex: number, rating: number): void {
    const feedbackGroup = this.feedbackControls[productIndex];
    feedbackGroup.get('rating')?.setValue(rating);
    feedbackGroup.get('rating')?.markAsDirty(); // Mark as dirty for validation display
  }

  onSubmitProductFeedback(productIndex: number): void {
    const feedbackGroup = this.feedbackControls[productIndex];

    if (feedbackGroup.invalid || feedbackGroup.get('submitted')?.value) {
      feedbackGroup.markAllAsTouched(); // Show validation errors if any
      return;
    }

    this.isLoading = true;
    feedbackGroup.get('submitError')?.setValue(null); // Clear previous error
    this.generalError = null;

    const feedbackData: CreateFeedbackDto = {
      productId: feedbackGroup.get('productId')?.value,
      rating: feedbackGroup.get('rating')?.value,
      comment: feedbackGroup.get('comment')?.value || null
    };

    // Add console log here to check the data being sent
    console.log('Submitting Feedback Data:', feedbackData);

    this.feedbackService.submitFeedback(feedbackData).subscribe({
      next: (response: FeedbackSubmissionResponse) => {
        this.isLoading = false;
        feedbackGroup.get('submitted')?.setValue(true); // Mark as submitted
        this.toastr.success(`تم إرسال تقييم المنتج "${this.productsToReview[productIndex].name}" بنجاح!`, 'نجاح');
        this.feedbackSubmitted.emit(feedbackData.productId); // Notify parent

        // Check if all feedbacks are submitted, if so, maybe close modal after a delay?
        if (this.feedbackControls.every(ctrl => ctrl.get('submitted')?.value)) {
          this.toastr.info('شكراً لك! تم تقييم جميع المنتجات.', 'اكتمل التقييم');
          setTimeout(() => this.close(), 1500); // Auto-close after 1.5 seconds
        }

      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.message || 'حدث خطأ غير متوقع أثناء إرسال التقييم.';
        feedbackGroup.get('submitError')?.setValue(errorMsg); // Set error for specific product
        this.toastr.error(errorMsg, 'خطأ في التقييم');
        console.error('Error submitting feedback:', err);
      }
    });
  }

  // Method to be called by the close button or overlay click
  close(): void {
    this.isVisible = false; // Hide the modal visually
    this.closeModal.emit(); // Emit event to parent
  }
}