import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For standalone
import { OrderService, Order } from '../../Services/order/order.service'; // Import service and interface
import { RouterModule } from '@angular/router'; // Optional: If linking to order details

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [CommonModule, RouterModule], // Import CommonModule and RouterModule
    templateUrl: './order-history.component.html',
    styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
    orders: Order[] = [];
    isLoading = true;
    errorMessage: string | null = null;

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.loadOrderHistory();
    }

    loadOrderHistory(): void {
        this.isLoading = true;
        this.errorMessage = null;
        this.orderService.getOrderHistory().subscribe({
            next: (data) => {
                this.orders = data;
                this.isLoading = false;
                console.log('Order history loaded:', this.orders);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Failed to load order history.';
                this.isLoading = false;
                console.error('Error loading order history:', err);
            }
        });
    }
} 