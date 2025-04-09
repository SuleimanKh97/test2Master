import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SellerDashboardService, SellerDashboardStats } from '../../Services/seller/seller-dashboard.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent implements OnInit {

  dashboardStats$: Observable<SellerDashboardStats | null> = of(null);
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private sellerDashboardService: SellerDashboardService) { }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.dashboardStats$ = this.sellerDashboardService.getDashboardStats().pipe(
      catchError(err => {
        console.error('Error loading seller dashboard stats:', err);
        this.errorMessage = err.message || 'Failed to load dashboard statistics.';
        this.isLoading = false;
        return of(null);
      })
    );

    this.dashboardStats$.subscribe({
      next: (stats) => {
        if (stats) {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });

  }
}
