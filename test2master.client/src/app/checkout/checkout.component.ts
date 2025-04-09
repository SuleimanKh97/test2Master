import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../Services/order/order.service';
// Optional: Import CartService to display cart summary
// import { CartService } from '../Services/cart/cart.service';
// Import the new PayPal service (we'll create a stub)
import { PaypalService } from '../Services/paypal/paypal.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
    checkoutForm!: FormGroup;
    submitted = false;
    isLoading = false;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    // Inject services
    constructor(
        private fb: FormBuilder,
        private orderService: OrderService,
        private router: Router,
        private paypalService: PaypalService // Inject PayPal service
        // public cartService: CartService // Inject if displaying summary
    ) { }

    ngOnInit(): void {
        // Initialize form (add fields for address, payment etc. later)
        this.checkoutForm = this.fb.group({
            // Example: Add dummy payment details for now
            paymentMethod: ['CashOnDelivery', Validators.required],
            // Add address fields later if needed
            // addressLine1: ['', Validators.required],
            // city: ['', Validators.required],
        });

        // Optional: Load cart summary if CartService is injected
        // this.cartService.loadCart(); // Assuming CartService has load method
    }

    get f() { return this.checkoutForm.controls; }

    onSubmit(): void {
        this.submitted = true;
        this.errorMessage = null;
        this.successMessage = null;

        if (this.checkoutForm.invalid) {
            return; // Stop if form is invalid (even if basic)
        }

        this.isLoading = true;
        const selectedPaymentMethod = this.checkoutForm.value.paymentMethod;

        if (selectedPaymentMethod === 'PayPal') {
            // --- Handle PayPal Payment --- 
            console.log("Initiating PayPal payment...");
            this.paypalService.createOrder().subscribe({
                next: (paypalResponse) => {
                    this.isLoading = false;
                    console.log("PayPal order created response:", paypalResponse);
                    // Check if response contains the approval link or order ID
                    if (paypalResponse.approvalUrl) {
                        // Redirect user to PayPal for approval
                        console.log("Redirecting to PayPal approval URL...");
                        window.location.href = paypalResponse.approvalUrl; // Redirect the whole window
                    } else {
                        this.errorMessage = "لم يتم استلام رابط PayPal. يرجى المحاولة مرة أخرى.";
                        console.error('PayPal response missing approvalUrl');
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = err.error?.message || "فشل إنشاء طلب PayPal.";
                    console.error('PayPal create order failed:', err);
                }
            });
            // -------------------------

        } else {
            // --- Handle Cash On Delivery (or other direct methods) --- 
            // Prepare data needed by createOrder (if any, like address)
            // For now, assume backend gets cart info from token
            const checkoutData = {
                paymentMethod: selectedPaymentMethod, // Pass payment method
                // Add other relevant form data (address, etc.) if needed by backend
            };
            console.log('Proceeding with standard checkout...', checkoutData);
            this.orderService.createOrder(checkoutData).subscribe({
                next: (response: any) => { // Added type 'any' to response
                    this.isLoading = false;
                    // Use a standard success message or extract from response if available
                    this.successMessage = response?.message || "تم إرسال طلبك بنجاح!";
                    console.log('Checkout successful:', response);
                    // TODO: Cart should be cleared by the backend now
                    this.checkoutForm.reset();
                    this.submitted = false;
                    // Consider showing order confirmation details instead of just redirecting
                    // Maybe navigate to a specific order confirmation page: /order/confirmation/:orderId
                    setTimeout(() => {
                        this.router.navigate(['/order-history']); // Redirect after a delay
                    }, 2000); // 2 second delay
                },
                error: (err: any) => { // Added type 'any' to err
                    this.isLoading = false;
                    this.errorMessage = err?.message || err?.error?.message || 'فشل إتمام الطلب. يرجى المحاولة مرة أخرى.';
                    console.error('Checkout failed:', err);
                }
            });
            // -----------------------------------------------------
        }
    }
} 