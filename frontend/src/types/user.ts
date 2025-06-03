
export type UserRole = 'admin' | 'customer' | 'delivery' | 'restaurant';

export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  address?: UserAddress[];
  isApproved?: boolean;
  createdAt: Date;
  earnings?: {
    today: number;
    weekly: number;
    monthly: number;
    total: number;
  };
  stats?: {
    totalOrders?: number;
    completedOrders?: number;
    cancelledOrders?: number;
  };
}

export interface UserAddress {
  id: string;
  title: string;
  fullAddress: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
