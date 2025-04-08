import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product } from '../Models/product.module';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'api/products'; // Replace with your actual API URL

  // Mock data for now, will be replaced with actual API calls
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'تيس شامي',
      price: 170.00,
      originalPrice: 182.50,
      imageUrl: './assets/images/products/tees-shami.jpeg',
      category: 'المواشي',
      inStock: true
    },
    {
      id: 2,
      name: 'خروف حري',
      price: 210.00,
      originalPrice: 222.50,
      imageUrl: 'assets/images/products/kharouf-hari.jpeg',
      category: 'المواشي',
      inStock: true
    },
    {
      id: 3,
      name: 'خروف بلدي',
      price: 205.00,
      originalPrice: 217.50,
      imageUrl: 'assets/images/products/kharouf-baladi.jpeg',
      category: 'المواشي',
      inStock: true
    },
    {
      id: 4,
      name: 'عابورة بلدي',
      price: 160.00,
      originalPrice: 172.50,
      imageUrl: 'assets/images/products/aaboura-baladi.jpeg',
      category: 'المواشي',
      inStock: true
    },
    {
      id: 5,
      name: 'name',
      price: 100.00,
      originalPrice: 125.00,
      imageUrl: 'assets/images/products/name.jpeg',
      category: 'المواشي',
      inStock: true
    },
    {
      id: 6,
      name: 'عجل بلدي',
      price: 800.00,
      originalPrice: 825.00,
      imageUrl: 'assets/images/products/ajel-baladi.jpeg',
      category: 'المواشي',
      inStock: true
    }
  ];

  constructor(private http: HttpClient) { }

  // Method to get all products (mock implementation for now)
  getProducts(): Observable<Product[]> {
    // When you have a real API, replace this with:
    // return this.http.get<Product[]>(this.apiUrl);
    return of(this.mockProducts);
  }

  // Method to get a single product by ID (mock implementation)
  getProduct(id: number): Observable<Product | undefined> {
    // When you have a real API, replace this with:
    // return this.http.get<Product>(`${this.apiUrl}/${id}`);
    const product = this.mockProducts.find(p => p.id === id);
    return of(product);
  }

  // Method to get products by category (mock implementation)
  getProductsByCategory(category: string): Observable<Product[]> {
    // When you have a real API, replace this with:
    // return this.http.get<Product[]>(`${this.apiUrl}?category=${category}`);
    const products = this.mockProducts.filter(p => p.category === category);
    return of(products);
  }

  // Add more methods for CRUD operations as needed
  // For example:
  // createProduct(product: Product): Observable<Product> {
  //   return this.http.post<Product>(this.apiUrl, product);
  // }
  //
  // updateProduct(id: number, product: Product): Observable<Product> {
  //   return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  // }
  //
  // deleteProduct(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // }
}
