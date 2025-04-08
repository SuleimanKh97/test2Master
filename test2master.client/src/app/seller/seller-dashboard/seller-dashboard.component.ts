import { Component } from '@angular/core';

@Component({
  selector: 'app-seller-dashboard',
  standalone: false,
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent {
  constructor() { }

  ngOnInit(): void {
    // Load seller's products and stats
  }

  addProduct(): void {
    console.log('إضافة منتج جديد');
  }

  editProduct(productId: number): void {
    console.log('تعديل المنتج رقم', productId);
  }

  deleteProduct(productId: number): void {
    console.log('حذف المنتج رقم', productId);
  }
}
