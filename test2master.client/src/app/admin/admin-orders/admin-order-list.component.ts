import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminOrderService, AdminOrder } from '../../Services/admin/admin-order.service';

@Component({
    selector: 'app-admin-order-list',
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe],
    providers: [DatePipe, CurrencyPipe],
    templateUrl: './admin-order-list.component.html',
    styleUrls: ['./admin-order-list.component.css'] // Shares styles
})
export class AdminOrderListComponent implements OnInit {
    orders$: Observable<AdminOrder[]> = of([]);
    isLoading = true;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    constructor(private adminOrderService: AdminOrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.isLoading = true;
        this.errorMessage = null;
        this.orders$ = this.adminOrderService.getAllOrders().pipe(
            catchError(err => {
                this.errorMessage = err.message || 'Failed to load orders.';
                this.isLoading = false;
                return of([]);
            })
        );
        this.orders$.subscribe(() => this.isLoading = false);
    }

    // Placeholder for changing order status
    changeStatus(order: AdminOrder): void {
        // Example using prompt, replace with modal/dropdown later
        const newStatus = prompt(`Enter new status for Order ${order.orderId}:`, order.status);
        if (newStatus) {
            console.log(`Attempting to change status for ${order.orderId} to ${newStatus}`);
            this.adminOrderService.updateOrderStatus(order.orderId, newStatus).subscribe({
                next: (res) => {
                    this.successMessage = res.message || 'Status updated successfully.';
                    this.loadOrders(); // Refresh list
                    setTimeout(() => this.successMessage = null, 3000);
                },
                error: (err) => this.errorMessage = err.message || 'Failed to update status.'
            });
        }
    }

    // Method to get a CSS class based on order status for styling
    getStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return 'text-muted'; // Default style
        }
    }
} 