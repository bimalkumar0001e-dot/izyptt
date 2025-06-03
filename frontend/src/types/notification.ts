
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'order' | 'status' | 'delivery' | 'system' | 'promo';
  isRead: boolean;
  orderId?: string;
  relatedId?: string;
}
