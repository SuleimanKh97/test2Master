import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService, CreateOrderResponse } from '../services/order.service';
import { PaymentService } from '../services/payment.service';
// Optional: Import CartService to display cart summary
// import { CartService } from '../services/cart.service';
// Remove PayPal service if not using it directly anymore
// import { PaypalService } from '../Services/paypal/paypal.service';

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
        private paymentService: PaymentService,
        private router: Router,
        // public cartService: CartService // Inject if displaying summary
    ) { }

    ngOnInit(): void {
        this.checkoutForm = this.fb.group({
            // Shipping Info
            shippingPhoneNumber: ['', [
                Validators.required,
                Validators.pattern(/^07[789]\d{7}$/), // Basic Jordanian mobile pattern
                Validators.maxLength(15) // Match backend
            ]],
            shippingAddressLine1: ['', [Validators.required, Validators.maxLength(100)]],
            shippingAddressLine2: ['', [Validators.maxLength(100)]], // Optional
            shippingCity: ['', [Validators.required, Validators.maxLength(50)]],
            // Payment Info
            paymentMethod: ['CashOnDelivery', Validators.required],
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
            console.log('Checkout form invalid:', this.checkoutForm.errors);
            // Optionally scroll to the first invalid field
            return;
        }

        this.isLoading = true;
        // Extract all form values, including shipping info
        const orderData = this.checkoutForm.value;
        console.log('Submitting Order Data:', orderData);

        // Pass the whole form value object to createOrder
        // OrderService needs to be updated to accept this structure
        this.orderService.createOrder(orderData).subscribe({
            next: (response: CreateOrderResponse) => { // Use the defined response type
                console.log('Create Order Response:', response);

                if (response.requiresPayment && response.primaryOrderId) {
                    console.log('Order requires payment, initiating simulation...');
                    this.initiateSimulation(response.primaryOrderId);
                } else {
                    this.isLoading = false;
                    this.successMessage = response.message || "تم إرسال طلبك بنجاح!";
                    console.log('Order created directly (COD):', response);
                    this.checkoutForm.reset(); // Reset the form after success
                    this.submitted = false;
                    // Redirect or show confirmation
                    setTimeout(() => {
                        this.router.navigate(['/order-history']);
                    }, 2000);
                }
            },
            error: (err: Error) => {
                this.isLoading = false;
                this.errorMessage = err?.message || 'فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.';
                console.error('Create Order failed:', err);
            }
        });
    }

    private initiateSimulation(orderId: number): void {
        this.paymentService.initiatePaymentSimulation(orderId).subscribe({
            next: (paymentResponse) => {
                this.isLoading = false; // Stop loading indicator before redirecting
                console.log('Payment Simulation Initiated:', paymentResponse);
                if (paymentResponse.simulationUrl) {
                    // Redirect to the simulation page
                    this.router.navigateByUrl(paymentResponse.simulationUrl);
                } else {
                    this.errorMessage = "لم يتم استلام رابط محاكاة الدفع.";
                    console.error('Initiate payment response missing simulationUrl');
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err?.message || 'فشل بدء محاكاة الدفع.';
                console.error('Initiate Payment Simulation failed:', err);
            }
        });
    }
} 