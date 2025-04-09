import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../services/order.service';
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
            console.log('Form invalid');
            return;
        }

        this.isLoading = true;
        const selectedPaymentMethod = this.checkoutForm.value.paymentMethod;
        console.log('Selected Payment Method:', selectedPaymentMethod);

        // Call OrderService to create the initial order entry
        this.orderService.createOrder(selectedPaymentMethod).subscribe({
            next: (response) => {
                console.log('Create Order Response:', response);

                if (response.requiresPayment && response.primaryOrderId) {
                    // Payment simulation is needed, initiate it
                    console.log('Order requires payment, initiating simulation...');
                    this.initiateSimulation(response.primaryOrderId);
                } else {
                    // Order created directly (e.g., COD), show success
                    this.isLoading = false;
                    this.successMessage = response.message || "تم إرسال طلبك بنجاح!";
                    console.log('Order created directly (COD):', response);
                    this.checkoutForm.reset();
                    this.submitted = false;
                    // Redirect to order history or confirmation page
                    setTimeout(() => {
                        this.router.navigate(['/order-history']);
                    }, 2000);
                }
            },
            error: (err) => {
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