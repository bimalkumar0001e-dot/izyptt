
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'packed'
  | 'out_for_delivery'
  | 'on_the_way'
  | 'heavy_traffic'
  | 'weather_delay'
  | 'delivered'
  | 'canceled';

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: Date;
  updatedBy: string;
  message?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId?: string;
  restaurantName?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'upi' | 'online';
  status: OrderStatus;
  statusUpdates: OrderStatusUpdate[];
  deliveryAddress: {
    fullAddress: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  orderDate: Date;
  deliveryDate?: Date;
  isAssigned: boolean;
}
