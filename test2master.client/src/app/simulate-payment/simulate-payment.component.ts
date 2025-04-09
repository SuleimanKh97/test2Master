import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../services/payment.service';

@Component({
    selector: 'app-simulate-payment',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './simulate-payment.component.html',
    styleUrls: ['./simulate-payment.component.css']
})
export class SimulatePaymentComponent implements OnInit {
    orderId: number | null = null;
    amount: number | null = null;
    isLoading = false;
    errorMessage: string | null = null;
    paymentMethod: string = 'SimulatedUnknown'; // Will try to guess or default

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private paymentService: PaymentService
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            const orderIdStr = params.get('orderId');
            const amountStr = params.get('amount');

            if (orderIdStr) {
                this.orderId = parseInt(orderIdStr, 10);
            }
            if (amountStr) {
                this.amount = parseFloat(amountStr);
            }

            if (!this.orderId) {
                this.errorMessage = "لم يتم العثور على معرف الطلب.";
                console.error('Order ID missing in query parameters');
            }
            // Simple guess for payment method - enhance if needed
            if (window.location.pathname.includes('paypal')) {
                this.paymentMethod = 'SimulatedPayPal';
            } else {
                this.paymentMethod = 'SimulatedCard'; // Default guess
            }
        });
    }

    confirmPayment(success: boolean): void {
        if (!this.orderId) {
            this.errorMessage = "معرف الطلب غير صالح للمتابعة.";
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        this.paymentService.confirmPaymentSimulation(this.orderId, success, this.paymentMethod).subscribe({
            next: (response) => {
                this.isLoading = false;
                console.log('Payment Confirmation Response:', response);
                if (success) {
                    // Navigate to a confirmation page (or order history)
                    // Pass orderId if the confirmation page needs it
                    this.router.navigate(['/order-confirmation'], { queryParams: { orderId: this.orderId } });
                } else {
                    // Payment failed, navigate back to cart or show specific message
                    alert("فشل الدفع (محاكاة)."); // Simple alert for now
                    this.router.navigate(['/cart']); // Or back to checkout?
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err?.message || 'حدث خطأ أثناء تأكيد حالة الدفع.';
                console.error('Confirm Payment Simulation failed:', err);
            }
        });
    }
} 