import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For standalone
import { OrderService, OrderDetailDTO, OrderItemDTO } from '../../services/order.service';
import { RouterModule } from '@angular/router'; // Optional: If linking to order details
import { Observable, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http'; // Import if needed, or use Error
// Import Feedback Modal and its dependencies
import { FeedbackModalComponent, ProductToReview } from '../../Shared/feedback-modal/feedback-modal.component';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [CommonModule, RouterModule, FeedbackModalComponent],
    templateUrl: './order-history.component.html',
    styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
    orders$: Observable<OrderDetailDTO[]> | undefined;
    errorMessage: string | null = null;
    selectedStatus: string = 'All'; // Default filter

    // State for Feedback Modal
    isFeedbackModalVisible = false;
    productsForReview: ProductToReview[] = [];
    currentOrderForFeedback: OrderDetailDTO | null = null;

    constructor(private orderService: OrderService, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(status?: string): void {
        console.log(`Loading orders with status: ${status || 'All'}`);
        this.errorMessage = null;
        this.orders$ = this.orderService.getMyOrders(status).pipe(
            catchError(err => {
                console.error('Error loading order history:', err);
                this.errorMessage = err.message || 'Failed to load order history.';
                return EMPTY;
            })
        );
    }

    filterByStatus(status: string): void {
        this.selectedStatus = status;
        const statusToFilter = status === 'All' ? undefined : status;
        this.loadOrders(statusToFilter);
    }

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

    getStatusTranslation(status: string): string {
        switch (status?.toLowerCase()) {
            case 'pending': return 'قيد الانتظار';
            case 'processing': return 'قيد المعالجة';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التوصيل';
            case 'cancelled': return 'ملغي';
            default: return status || 'غير معروف';
        }
    }

    cancelOrder(orderId: number): void {
        this.errorMessage = null;
        if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
            this.orderService.cancelOrder(orderId).subscribe({
                next: (response) => {
                    console.log('Order cancelled response:', response);
                    this.toastr.success('تم إلغاء الطلب بنجاح.');
                    this.loadOrders(this.selectedStatus === 'All' ? undefined : this.selectedStatus);
                },
                error: (err) => {
                    console.error('Error cancelling order:', err);
                    this.errorMessage = err.message || 'فشل إلغاء الطلب.';
                    this.toastr.error(this.errorMessage ?? 'فشل إلغاء الطلب.', 'خطأ');
                }
            });
        }
    }

    markAsDelivered(order: OrderDetailDTO): void {
        this.errorMessage = null;
        if (!order || !order.orderItems) return;

        if (confirm('هل أنت متأكد من استلام هذا الطلب؟')) {
            this.orderService.markOrderAsDelivered(order.orderId).subscribe({
                next: (response: { message: string }) => {
                    console.log('Mark as delivered response:', response);
                    this.toastr.success(response.message || 'تم تحديث حالة الطلب بنجاح.');
                    this.openFeedbackModal(order);
                },
                error: (err: Error) => {
                    console.error('Error marking order as delivered:', err);
                    this.errorMessage = err.message || 'فشل تأكيد استلام الطلب.';
                    this.toastr.error(this.errorMessage, 'خطأ');
                }
            });
        }
    }

    openFeedbackModal(order: OrderDetailDTO): void {
        if (!order.orderItems || order.orderItems.length === 0) {
            this.toastr.info("لا توجد منتجات لتقييمها في هذا الطلب.");
            this.loadOrders(this.selectedStatus === 'All' ? undefined : this.selectedStatus);
            return;
        }

        this.productsForReview = order.orderItems.map(item => ({
            id: (item as any).productId,
            name: item.productName,
            imageUrl: item.imageUrl
        })).filter(p => p.id);

        if (this.productsForReview.length === 0) {
            this.toastr.warning("لم نتمكن من تحديد المنتجات لتقييمها.");
            this.loadOrders(this.selectedStatus === 'All' ? undefined : this.selectedStatus);
            return;
        }

        this.currentOrderForFeedback = order;
        this.isFeedbackModalVisible = true;
        console.log("Opening feedback modal for order:", order.orderId, "Products:", this.productsForReview);
    }

    closeFeedbackModal(): void {
        this.isFeedbackModalVisible = false;
        this.currentOrderForFeedback = null;
        this.productsForReview = [];
        this.loadOrders(this.selectedStatus === 'All' ? undefined : this.selectedStatus);
        console.log("Feedback modal closed, refreshing orders...");
    }

    handleFeedbackSubmitted(productId: number): void {
        console.log(`Feedback submitted for product ${productId}`);
    }
} 