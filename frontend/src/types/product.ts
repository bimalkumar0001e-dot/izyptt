export interface Product {
  id: string;
  _id?: string; // <-- allow backend _id
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  restaurant: string;
  restaurantId?: string;
  isVeg: boolean;
  rating: number;
  ratingCount?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  discount?: number;
  discountedPrice?: number;
  inStock?: boolean;
  createdAt?: Date;
  updatedAt?: Date; // Added updatedAt property
}

export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  image: string;
  heroImage?: string;
  rating: number;
  ratingCount?: number;
  categories: string[];
  deliveryTime: string;
  address: string;
  distance?: string;
  minOrder?: number;
  deliveryFee?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  isOpen?: boolean;
  description?: string;
}

export interface Offer {
  id: string;
  title: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: Date;
  validTo: Date;
  validUntil?: Date;
  isActive: boolean;
  usageCount: number;
}

export interface CartItem {
  _id?: string; // Unique cart item id from backend
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  restaurant?: string;
  restaurantId?: string;
}

export interface RecentService {
  id: string;
  type: 'food' | 'groceries' | 'pickup' | 'scrap';
  name: string;
  icon: string;
  colorClass: string;
}
