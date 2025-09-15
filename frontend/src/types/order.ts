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
  handlingCharge?: number; // Add handlingCharge for compatibility
  taxAmount?: number; // Add taxAmount for compatibility
  tax?: number; // Keep for compatibility
  discount: number;
  total: number;
  finalAmount?: number; // Add finalAmount for compatibility
  paymentMethod: 'cash' | 'upi' | 'online';
  status: OrderStatus;
  statusUpdates: OrderStatusUpdate[];
  deliveryAddress: {
    title?: string;
    fullAddress: string;
    address?: string; // Add address for compatibility
    landmark?: string;
    city: string;
    state?: string; // Add state for compatibility
    pincode: string;
    distance?: number;
  };
  deliveryInstructions?: string;
  orderDate: Date;
  deliveryDate?: Date;
  isAssigned: boolean;
  createdAt?: Date; // Add createdAt for compatibility
  cancellationReason?: string; // Reason entered by admin when cancelled
}
