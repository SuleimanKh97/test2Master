import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For standalone
import { OrderService, OrderDetailDTO } from '../../services/order.service';
import { RouterModule } from '@angular/router'; // Optional: If linking to order details
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http'; // Import if needed, or use Error

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [CommonModule, RouterModule], // Import CommonModule and RouterModule
    templateUrl: './order-history.component.html',
    styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
    orders$: Observable<OrderDetailDTO[]> | undefined;
    filteredOrders$: Observable<OrderDetailDTO[]> | undefined;
    errorMessage: string | null = null;
    selectedStatus: string = 'All'; // Default filter

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(status?: string): void {
        console.log(`Loading orders with status: ${status || 'All'}`);
        this.errorMessage = null;
        // Store the full observable
        this.orders$ = this.orderService.getMyOrders(status).pipe(
            catchError(err => {
                console.error('Error loading order history:', err);
                this.errorMessage = err.message || 'Failed to load order history.';
                return EMPTY; // Return empty observable on error
            })
        );
        // Initially, filtered orders are the same as loaded orders
        this.filteredOrders$ = this.orders$;
    }

    // Optional: Add filtering logic if needed later based on UI elements
    filterByStatus(status: string): void {
        this.selectedStatus = status;
        const statusToFilter = status === 'All' ? undefined : status;
        this.loadOrders(statusToFilter);
        // If you want client-side filtering after initial load:
        // if (this.orders$) {
        //     this.filteredOrders$ = this.orders$.pipe(
        //         map(orders => status === 'All' ? orders : orders.filter(o => o.status === status))
        //     );
        // }
    }

    // Helper function to get CSS class based on status
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

    // Helper function to translate status
    getStatusTranslation(status: string): string {
        switch (status?.toLowerCase()) {
            case 'pending': return 'قيد الانتظار';
            case 'processing': return 'قيد المعالجة';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التوصيل';
            case 'cancelled': return 'ملغي';
            default: return status || 'غير معروف'; // Return original or Unknown
        }
    }

    cancelOrder(orderId: number): void {
        this.errorMessage = null;
        if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
            this.orderService.cancelOrder(orderId).subscribe({
                next: (response) => {
                    console.log('Order cancelled response:', response);
                    alert('تم إلغاء الطلب بنجاح.');
                    // Refresh the order list to reflect the change
                    this.loadOrders(this.selectedStatus === 'All' ? undefined : this.selectedStatus);
                },
                error: (err) => {
                    console.error('Error cancelling order:', err);
                    this.errorMessage = err.message || 'فشل إلغاء الطلب.';
                }
            });
        }
    }

    markAsDelivered(orderId: number): void {
        this.errorMessage = null;
        if (confirm('هل أنت متأكد من استلام هذا الطلب؟')) {
            this.orderService.markOrderAsDelivered(orderId).subscribe({
                next: (response: { message: string }) => {
                    console.log('Mark as delivered response:', response);
                    alert(response.message || 'تم تحديث حالة الطلب بنجاح.');
                    this.loadOrders(this.selectedStatus === 'All' ? undefined : this.selectedStatus);
                },
                error: (err: Error) => {
                    console.error('Error marking order as delivered:', err);
                    this.errorMessage = err.message || 'فشل تأكيد استلام الطلب.';
                }
            });
        }
    }
} 