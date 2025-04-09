import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { RouterModule } from '@angular/router';
import { SellerOrderService, SellerOrder } from '../../Services/seller/seller-order.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-seller-order-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        // No need to explicitly import DatePipe here if using standalone component providers
        // If using modules, DatePipe would need to be in imports or providers
    ],
    providers: [DatePipe], // Provide DatePipe for standalone component
    templateUrl: './seller-order-list.component.html',
    styleUrls: ['./seller-order-list.component.css']
})
export class SellerOrderListComponent implements OnInit {

    sellerOrders$: Observable<SellerOrder[]> = of([]);
    isLoading = true;
    errorMessage: string | null = null;

    constructor(private sellerOrderService: SellerOrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.isLoading = true;
        this.errorMessage = null;
        this.sellerOrders$ = this.sellerOrderService.getSellerOrders().pipe(
            catchError(err => {
                console.error('Error loading seller orders:', err);
                this.errorMessage = 'حدث خطأ أثناء جلب الطلبات. يرجى المحاولة مرة أخرى.';
                this.isLoading = false;
                return of([]); // Return empty array on error
            })
        );

        // Basic loading indicator handling
        this.sellerOrders$.subscribe(() => this.isLoading = false);
    }

    // Potential future method to view order details
    viewOrderDetails(orderId: string | number): void {
        console.log(`Navigate to details for order: ${orderId}`);
        // this.router.navigate(['/seller/orders', orderId]); // Requires Router injection and detail component
    }

    // Method to get a CSS class based on order status for styling
    getStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    }
} 