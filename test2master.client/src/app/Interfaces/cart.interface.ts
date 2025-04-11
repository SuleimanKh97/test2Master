export interface CartItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string; // Optional image URL
}

export interface Cart {
    items: CartItem[];
    totalPrice: number;
    totalItems: number;
}
