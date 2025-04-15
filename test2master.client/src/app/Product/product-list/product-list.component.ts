import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../Models/product.module';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe(
      (products) => {
        this.products = products;
        this.loading = false;
      },
      (error) => {
        this.error = 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    );
  }
}
