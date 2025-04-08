import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CartItem, CartService } from '../Services/cart/cart.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartItems$!: Observable<CartItem[]>;
  cartTotal$!: Observable<number>;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartItems$ = this.cartService.getCartItems().pipe(
      map(items => items.filter(item => item.product != null))
    );
    this.cartTotal$ = this.cartService.getCartTotal();
  }

  onQuantityChange(productId: number, value: string): void {
    const quantity = Number(value);
    if (quantity >= 1) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }
}

