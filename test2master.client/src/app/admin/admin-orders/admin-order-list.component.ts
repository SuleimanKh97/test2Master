import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, EMPTY, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { AdminOrderService, AdminOrder } from '../../Services/admin/admin-order.service'; 
import { AdminService, AdminOrderDetailDTO } from '../../services/admin.service';

@Component({
    selector: 'app-admin-order-list',
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe],
    providers: [DatePipe, CurrencyPipe],
    templateUrl: './admin-order-list.component.html',
    styleUrls: ['./admin-order-list.component.css'] // Shares styles
})
export class AdminOrderListComponent implements OnInit {
    orders$: Observable<AdminOrderDetailDTO[]> | undefined;
    isLoading = false;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadAllOrders();
    }

    loadAllOrders(): void {
        console.log('AdminOrderList: Loading all orders...');
        this.isLoading = true;
        this.errorMessage = null;
        this.orders$ = this.adminService.getAllOrders().pipe(
            tap(data => {
                console.log('Admin Raw Orders Data:', data);
                this.isLoading = false;
            }),
            catchError(err => {
                console.error('AdminOrderList: Error loading orders:', err);
                this.errorMessage = err.message || 'Failed to load orders.';
                this.isLoading = false;
                return EMPTY;
            })
        );
    }

    /* Completely comment out the changeStatus function
    // Placeholder for changing order status
    changeStatus(order: AdminOrder): void {
        // Example using prompt, replace with modal/dropdown later
        const newStatus = prompt(`Enter new status for Order ${order.orderId}:`, order.status);
        if (newStatus) {
            console.log(`Attempting to change status for ${order.orderId} to ${newStatus}`);
            // this.adminOrderService.updateOrderStatus(order.orderId, newStatus).subscribe({
            //     next: (res) => {
            //         this.successMessage = res.message || 'Status updated successfully.';
            //         this.loadAllOrders(); // Refresh list
            //         setTimeout(() => this.successMessage = null, 3000);
            //     },
            //     error: (err) => this.errorMessage = err.message || 'Failed to update status.'
            // });
        }
    }
    */

    // Method to get a CSS class based on order status for styling
    getStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            case 'paymentfailed': return 'status-failed';
            default: return 'text-muted'; // Default style
        }
    }

    // Helper function to translate status
    getStatusTranslation(status: string): string {
        switch (status?.toLowerCase()) {
            case 'pending': return 'قيد الانتظار';
            case 'processing': return 'قيد المعالجة';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التوصيل';
            case 'cancelled': return 'ملغي';
            case 'paymentfailed': return 'فشل الدفع';
            default: return status || 'غير معروف';
        }
    }

    // Optional: Add method to refresh data
    refreshOrders(): void {
        this.loadAllOrders();
    }
} 