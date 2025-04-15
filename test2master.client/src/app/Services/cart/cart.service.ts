import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartItem } from '../../interfaces/cart.interface';

interface CartItemResponseDTO {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string | null;
}

interface AddItemToCartRequestDTO {
  productId: number;
  quantity: number;
}

interface UpdateCartItemQuantityRequestDTO {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://localhost:7158/Cart';

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  private cartCountSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.loadCartFromServer();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  getCartTotal(): Observable<number> {
    return this.cartTotalSubject.asObservable();
  }

  getCartCount(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  // --- Public Method to Force Refresh ---
  refreshCart(): Observable<CartItem[]> {
    // Simply trigger the reload mechanism
    console.log('CartService: Explicitly refreshing cart from server...');
    return this.loadCartFromServer();
  }

  private loadCartFromServer(): Observable<CartItem[]> {
    console.log('CartService: Loading cart from server...');
    return this.http.get<CartItemResponseDTO[]>(this.apiUrl).pipe(
      map(dtos => this.mapDtosToCartItems(dtos)),
      tap(cartItems => {
        console.log('CartService: Cart loaded/refreshed:', cartItems);
        this.updateSubjects(cartItems);
      }),
      catchError(this.handleError<CartItem[]>('loadCartFromServer', []))
    );
  }

  addToCart(product: { id: number }, quantity = 1): Observable<CartItem[]> {
    console.log(`CartService: Adding product ${product.id} with quantity ${quantity} to server cart...`);
    const request: AddItemToCartRequestDTO = {
      productId: product.id,
      quantity: quantity
    };
    return this.http.post<any>(this.apiUrl, request).pipe(
      switchMap(() => this.loadCartFromServer()),
      catchError(this.handleError<CartItem[]>('addToCart'))
    );
  }

  updateQuantity(productId: number, quantity: number): Observable<CartItem[]> {
    console.log(`CartService: Updating product ${productId} quantity to ${quantity} on server...`);
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    const request: UpdateCartItemQuantityRequestDTO = { quantity };
    const url = `${this.apiUrl}/${productId}`;
    return this.http.put<any>(url, request).pipe(
      switchMap(() => this.loadCartFromServer()),
      catchError(this.handleError<CartItem[]>('updateQuantity'))
    );
  }

  removeFromCart(productId: number): Observable<CartItem[]> {
    console.log(`CartService: Removing product ${productId} from server cart...`);
    const url = `${this.apiUrl}/${productId}`;
    return this.http.delete<any>(url).pipe(
      switchMap(() => this.loadCartFromServer()),
      catchError(this.handleError<CartItem[]>('removeFromCart'))
    );
  }

  clearCart(): Observable<CartItem[]> {
    console.log('CartService: Clearing server cart...');
    return this.http.delete<any>(this.apiUrl).pipe(
      switchMap(() => this.loadCartFromServer()),
      catchError(this.handleError<CartItem[]>('clearCart'))
    );
  }

  private mapDtosToCartItems(dtos: CartItemResponseDTO[]): CartItem[] {
    return dtos.map(dto => ({
      productId: dto.productId,
      productName: dto.productName,
      price: dto.price,
      quantity: dto.quantity,
      imageUrl: dto.imageUrl ?? undefined
    }));
  }

  private updateSubjects(cartItems: CartItem[]): void {
    this.cartItemsSubject.next([...cartItems]);

    const total = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    this.cartTotalSubject.next(total);

    const count = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    this.cartCountSubject.next(count);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      let userMessage = `An error occurred during ${operation}.`;
      if (error.status === 401) {
        userMessage = "Authentication required. Please log in.";
      }
      return throwError(() => new Error(`${userMessage} Status: ${error.status}`));
    };
  }
}
