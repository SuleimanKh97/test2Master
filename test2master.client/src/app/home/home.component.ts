import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Product } from '../Models/product.module';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  featuredProducts: Product[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.productService.getProducts().subscribe(
      (products) => {
        // Just use the first 3 products for the homepage
        this.featuredProducts = products.slice(0, 3);
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

}
