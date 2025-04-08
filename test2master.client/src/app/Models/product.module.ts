export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  category: string;
  description?: string;
  inStock?: boolean;
}
