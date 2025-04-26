import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// واجهة لإحصائيات المنتج الأكثر مبيعًا
export interface TopProductStat {
    productId: number;
    productName: string;
    totalSold: number;
    totalRevenue: number;
}

// واجهة لإحصائيات المبيعات الشهرية
export interface MonthlySalesStat {
    month: number;
    year: number;
    monthName: string;
    totalSales: number;
}

// واجهة لإحصائيات لوحة المعلومات
export interface SellerDashboardStats {
    totalProducts: number;
    soldProducts: number;
    availableProducts: number;
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: { [key: string]: number };
    topProducts: TopProductStat[];
    monthlySales: MonthlySalesStat[];
}

// واجهة لملخص الطلبات
export interface OrderSummary {
    totalOrders: number;
    ordersByStatus: { [key: string]: number };
    recentOrders: RecentOrder[];
    orderTrends: OrderTrend[];
}

// واجهة للطلبات الحديثة
export interface RecentOrder {
    orderId: number;
    date: string;
    status: string;
    totalAmount: number;
    buyerName: string;
}

// واجهة لاتجاهات الطلبات
export interface OrderTrend {
    month: number;
    year: number;
    monthName: string;
    orderCount: number;
    totalRevenue: number;
}

@Injectable({
    providedIn: 'root'
})
export class SellerDashboardService {

    // Use the full base path for the Seller controller
    // WARNING: Hardcoding URL is not ideal. Use proxy or environment variables.
    private apiUrl = 'https://localhost:7158/Seller'; // Assuming SellerController path

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("SellerDashboardService: Auth token not found in localStorage.");
            // Handle missing token case - maybe throw error or return empty observable
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        });
    }

    /** Fetches dashboard statistics for the logged-in seller */
    getDashboardStats(): Observable<SellerDashboardStats> {
        console.log('SellerDashboardService: Fetching dashboard stats from API...');
        return this.http.get<SellerDashboardStats>(`${this.apiUrl}/dashboard`, { headers: this.getAuthHeaders() })
            .pipe(catchError(this.handleError));
    }

    /** Fetches order summary data for the logged-in seller */
    getOrdersSummary(): Observable<OrderSummary> {
        console.log('SellerDashboardService: Fetching orders summary from API...');

        // إضافة تشخيص لعملية الطلب
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('SellerDashboardService: No authentication token found!');
        } else {
            console.log('SellerDashboardService: Token is present, length:', token.length);
        }

        // طباعة عنوان API المستخدم
        console.log(`SellerDashboardService: Requesting ${this.apiUrl}/orders/summary`);

        return this.http.get<OrderSummary>(`${this.apiUrl}/orders/summary`, {
            headers: this.getAuthHeaders(),
            // إضافة خيار لمنع التخزين المؤقت
            params: { '_': Date.now().toString() }
        })
            .pipe(
                catchError(error => {
                    console.error('SellerDashboardService: Error fetching order summary:', error);

                    if (error.status === 0) {
                        console.error('SellerDashboardService: Network error - server might be down');
                    } else if (error.status === 401) {
                        console.error('SellerDashboardService: Authentication error - invalid token');
                    } else if (error.status === 403) {
                        console.error('SellerDashboardService: Authorization error - not a seller');
                    } else {
                        console.error(`SellerDashboardService: Server error (${error.status}):`, error.error);
                    }

                    // إعادة خطأ واضح للمستخدم
                    return throwError(() => new Error(`فشل تحميل بيانات الطلبات. الخطأ: ${error.status} ${error.statusText}`));
                })
            );
    }

    // Shared error handler
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = error.error?.message || `Server error (status ${error.status})`;
        }
        console.error('Seller API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}