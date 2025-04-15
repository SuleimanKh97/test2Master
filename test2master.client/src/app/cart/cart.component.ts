import { Component, OnInit, OnDestroy } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { CartService } from '../services/cart/cart.service';
import { CartItem } from '../interfaces/cart.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems$!: Observable<CartItem[]>;
  cartTotal$!: Observable<number>;
  errorMessage: string | null = null;
  private subscriptions = new Subscription(); // To manage subscriptions

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartItems$ = this.cartService.getCartItems();
    this.cartTotal$ = this.cartService.getCartTotal();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onQuantityChange(productId: number, event: Event): void {
    this.errorMessage = null;
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    const quantity = Number(value);

    if (inputElement && !isNaN(quantity)) {
      const sub = this.cartService.updateQuantity(productId, quantity).subscribe({
        error: (err) => {
          console.error('Error updating quantity:', err);
          this.errorMessage = err.message || 'Failed to update quantity.';
        }
      });
      this.subscriptions.add(sub);
    } else {
      console.warn('Invalid quantity input or event target:', value);
    }
  }

  removeItem(productId: number): void {
    this.errorMessage = null;
    if (confirm('Are you sure you want to remove this item?')) {
      const sub = this.cartService.removeFromCart(productId).subscribe({
        error: (err) => {
          console.error('Error removing item:', err);
          this.errorMessage = err.message || 'Failed to remove item.';
        }
      });
      this.subscriptions.add(sub);
    }
  }

  clearCart(): void {
    this.errorMessage = null;
    if (confirm('Are you sure you want to clear the entire cart?')) {
      const sub = this.cartService.clearCart().subscribe({
        error: (err) => {
          console.error('Error clearing cart:', err);
          this.errorMessage = err.message || 'Failed to clear cart.';
        }
      });
      this.subscriptions.add(sub);
    }
  }
}

