export interface PaymentMethod {
  _id?: string;
  id?: string;
  name: string;
  details?: string;
  description?: string;
  image?: string;
  paymentGuide?: string;
  instructions?: string;
  active?: boolean;
}
