import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {
  SellerDashboardService,
  SellerDashboardStats,
  OrderSummary,
  RecentOrder,
  TopProductStat
} from '../../Services/seller/seller-dashboard.service';

interface ProductSummary {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  salesCount: number;
  revenue: number;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent implements OnInit {
  // Dashboard data
  totalProducts: number = 0;
  totalOrders: number = 0;
  totalRevenue: number = 0;
  soldProducts: number = 0;
  availableProducts: number = 0;

  // Loading states
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Table data
  topProducts: ProductSummary[] = [];
  recentOrders: RecentOrder[] = [];

  // Backend API URL - update this with your actual API URL
  private apiUrl = 'https://localhost:7158/api';

  constructor(private http: HttpClient, private sellerDashboardService: SellerDashboardService) { }

  ngOnInit(): void {
    // Load real data
    this.loadDashboardData();
  }

  refreshData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Show loading state
    this.isLoading = true;

    // Fetch dashboard stats
    this.sellerDashboardService.getDashboardStats().pipe(
      catchError(error => {
        console.error('Error fetching dashboard data:', error);
        this.errorMessage = 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
        // Return empty data as fallback
        return of({
          totalProducts: 0,
          soldProducts: 0,
          availableProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          ordersByStatus: {},
          topProducts: [],
          monthlySales: []
        } as SellerDashboardStats);
      }),
      finalize(() => {
        // Set loading state to false when done (whether successful or failed)
        this.isLoading = false;
      })
    ).subscribe(stats => {
      // Update general statistics
      this.totalProducts = stats.totalProducts;
      this.soldProducts = stats.soldProducts;
      this.availableProducts = stats.availableProducts;
      this.totalOrders = stats.totalOrders;
      this.totalRevenue = stats.totalRevenue;

      // Map top products from API response
      this.topProducts = stats.topProducts.map(product => ({
        id: product.productId,
        name: product.productName,
        imageUrl: `${this.apiUrl}/products/${product.productId}/image`, // Adjust based on your API
        price: 0, // This needs to be provided by your API
        salesCount: product.totalSold,
        revenue: product.totalRevenue
      }));
    });

    // Fetch orders data
    this.sellerDashboardService.getOrdersSummary().pipe(
      catchError(error => {
        console.error('Error fetching orders data:', error);
        // Don't show another error message since we already have one from stats
        return of({
          totalOrders: 0,
          ordersByStatus: {},
          recentOrders: [],
          orderTrends: []
        } as OrderSummary);
      })
    ).subscribe(orderSummary => {
      // Update orders data
      this.recentOrders = orderSummary.recentOrders;
    });
  }

  // Alternative fallback to load mock data if API fails completely
  loadMockData(): void {
    // Simple statistics
    this.totalProducts = 86;
    this.soldProducts = 65;
    this.availableProducts = 21;
    this.totalOrders = 124;
    this.totalRevenue = 27850;

    // Top products
    this.topProducts = [
      {
        id: 1,
        name: 'حقيبة يد جلدية فاخرة',
        imageUrl: 'assets/img/products/bag.jpg',
        price: 350,
        salesCount: 42,
        revenue: 14700
      },
      {
        id: 2,
        name: 'ساعة يد رجالية كلاسيكية',
        imageUrl: 'assets/img/products/watch.jpg',
        price: 520,
        salesCount: 28,
        revenue: 14560
      },
      {
        id: 3,
        name: 'عطر نسائي فرنسي',
        imageUrl: 'assets/img/products/perfume.jpg',
        price: 280,
        salesCount: 35,
        revenue: 9800
      },
      {
        id: 4,
        name: 'نظارة شمسية رجالية',
        imageUrl: 'assets/img/products/sunglasses.jpg',
        price: 175,
        salesCount: 31,
        revenue: 5425
      },
      {
        id: 5,
        name: 'حذاء رياضي مريح',
        imageUrl: 'assets/img/products/shoes.jpg',
        price: 225,
        salesCount: 23,
        revenue: 5175
      }
    ];

    // Recent orders
    this.recentOrders = [
      {
        orderId: 8452,
        date: '2023-10-15',
        buyerName: 'أحمد محمد',
        totalAmount: 870,
        status: 'تم التسليم'
      },
      {
        orderId: 8451,
        date: '2023-10-14',
        buyerName: 'سارة أحمد',
        totalAmount: 1450,
        status: 'قيد المعالجة'
      },
      {
        orderId: 8450,
        date: '2023-10-13',
        buyerName: 'محمد علي',
        totalAmount: 650,
        status: 'تم الشحن'
      },
      {
        orderId: 8449,
        date: '2023-10-12',
        buyerName: 'فاطمة حسن',
        totalAmount: 320,
        status: 'تم التسليم'
      },
      {
        orderId: 8448,
        date: '2023-10-11',
        buyerName: 'خالد عبدالله',
        totalAmount: 1200,
        status: 'ملغي'
      }
    ];

    this.isLoading = false;
  }

  // Format date for display
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Get status class for styling
  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'تم التسليم': 'status-delivered',
      'قيد المعالجة': 'status-processing',
      'تم الشحن': 'status-shipped',
      'ملغي': 'status-cancelled',
      'قيد الانتظار': 'status-pending'
    };

    return statusMap[status] || '';
  }
}
