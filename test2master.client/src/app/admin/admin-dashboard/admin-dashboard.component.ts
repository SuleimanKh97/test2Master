import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  totalUsers: number = 0;
  totalProducts: number = 0;
  totalOrders: number = 0;

  constructor() { }

  ngOnInit(): void {
    // Load users, products, etc.
  }

  // Example methods
  manageUsers(): void {
    console.log('إدارة المستخدمين');
  }

  manageProducts(): void {
    console.log('إدارة المنتجات');
  }
}
