import { Product, Restaurant } from '@/types/product';
import { Order } from '@/types/order';

export const restaurants: Restaurant[] = [
  {
    id: 'rest1',
    name: 'Bihari Kitchen',
    description: 'Authentic Bihari food with great taste',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D',
    categories: ['Bihari', 'North Indian'],
    rating: 4.5,
    ratingCount: 120,
    deliveryTime: 30,
    minOrder: 100,
    deliveryFee: 40,
    address: 'Boring Road, Patna',
    isOpen: true,
  },
  {
    id: 'rest2',
    name: 'Litti Express',
    description: 'Famous for Litti Chokha and other Bihari delicacies',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D',
    categories: ['Bihari', 'Street Food'],
    rating: 4.2,
    ratingCount: 85,
    deliveryTime: 35,
    minOrder: 150,
    deliveryFee: 30,
    address: 'Gandhi Maidan, Patna',
    isOpen: true,
  },
  {
    id: 'rest3',
    name: 'Desi Tadka',
    description: 'Multi-cuisine restaurant with local flavors',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D',
    categories: ['Bihari', 'North Indian', 'Chinese'],
    rating: 3.9,
    ratingCount: 64,
    deliveryTime: 45,
    minOrder: 200,
    deliveryFee: 50,
    address: 'Patliputra Colony, Patna',
    isOpen: true,
  },
  {
    id: 'rest4',
    name: 'Sweet Corner',
    description: 'Authentic sweets and desserts',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D',
    categories: ['Sweets', 'Desserts'],
    rating: 4.7,
    ratingCount: 42,
    deliveryTime: 25,
    minOrder: 100,
    deliveryFee: 30,
    address: 'Kankarbagh, Patna',
    isOpen: true,
  },
];

export const foodItems: Product[] = [
  {
    id: 'food1',
    name: 'Litti Chokha',
    description: 'Traditional Bihari dish made with whole wheat flour and stuffed with sattu',
    price: 120,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW5kaWFuJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D',
    category: 'Bihari',
    restaurantId: 'rest2',
    restaurant: 'Litti Express',
    inStock: true,
    isVeg: true,
    rating: 4.5,
    ratingCount: 132,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food2',
    name: 'Thali Special',
    description: 'Complete meal with rice, dal, vegetables, roti, and more',
    price: 180,
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kaWFuJTIwdGhhbGl8ZW58MHx8MHx8fDA%3D',
    category: 'North Indian',
    restaurantId: 'rest1',
    restaurant: 'Bihari Kitchen',
    inStock: true,
    isVeg: true,
    rating: 4.3,
    ratingCount: 98,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food3',
    name: 'Chicken Curry',
    description: 'Spicy chicken curry cooked in Bihari style',
    price: 220,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGluZGlhbiUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
    category: 'Non-Veg',
    restaurantId: 'rest1',
    restaurant: 'Bihari Kitchen',
    inStock: true,
    isVeg: false,
    rating: 4.6,
    ratingCount: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food4',
    name: 'Dal Puri',
    description: 'Fried bread stuffed with spiced lentils',
    price: 80,
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aW5kaWFuJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D',
    category: 'Bihari',
    restaurantId: 'rest2',
    restaurant: 'Litti Express',
    inStock: true,
    isVeg: true,
    rating: 4.2,
    ratingCount: 54,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food5',
    name: 'Kheer',
    description: 'Traditional rice pudding dessert',
    price: 90,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGluZGlhbiUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
    category: 'Desserts',
    restaurantId: 'rest4',
    restaurant: 'Sweet Corner',
    inStock: true,
    isVeg: true,
    rating: 4.7,
    ratingCount: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food6',
    name: 'Chana Masala',
    description: 'Spicy chickpea curry',
    price: 140,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aW5kaWFuJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D',
    category: 'North Indian',
    restaurantId: 'rest3',
    restaurant: 'Desi Tadka',
    inStock: true,
    isVeg: true,
    rating: 4.1,
    ratingCount: 37,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const groceryItems: Product[] = [
  {
    id: 'groc1',
    name: 'Rice (5kg)',
    description: 'Premium quality Basmati rice',
    price: 350,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZXxlbnwwfHwwfHx8MA%3D%3D',
    category: 'Staples',
    inStock: true,
    rating: 4.4,
    ratingCount: 89,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'groc2',
    name: 'Wheat Flour (5kg)',
    description: 'Fresh stone-ground wheat flour',
    price: 250,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1c0cf4e11?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2hlYXQlMjBmbG91cnxlbnwwfHwwfHx8MA%3D%3D',
    category: 'Staples',
    inStock: true,
    rating: 4.3,
    ratingCount: 76,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'groc3',
    name: 'Cooking Oil (1L)',
    description: 'Refined sunflower oil',
    price: 180,
    image: 'https://plus.unsplash.com/premium_photo-1664201890375-f8fa405cdb7d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y29va2luZyUyMG9pbHxlbnwwfHwwfHx8MA%3D%3D',
    category: 'Cooking Essentials',
    inStock: true,
    rating: 4.0,
    ratingCount: 52,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'groc4',
    name: 'Dal Mix (2kg)',
    description: 'Mix of various lentils',
    price: 220,
    image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVudGlsc3xlbnwwfHwwfHx8MA%3D%3D',
    category: 'Staples',
    inStock: true,
    rating: 4.2,
    ratingCount: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'groc5',
    name: 'Milk (1L)',
    description: 'Fresh cow milk',
    price: 60,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pbGt8ZW58MHx8MHx8fDA%3D',
    category: 'Dairy',
    inStock: true,
    rating: 4.5,
    ratingCount: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'groc6',
    name: 'Sugar (1kg)',
    description: 'Refined white sugar',
    price: 45,
    image: 'https://images.unsplash.com/photo-1581539250439-c96689abccf0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VnYXJ8ZW58MHx8MHx8fDA%3D',
    category: 'Cooking Essentials',
    inStock: true,
    rating: 4.0,
    ratingCount: 38,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockOrders: Order[] = [
  {
    id: 'order1',
    customerId: 'customer1',
    customerName: 'Rahul Kumar',
    customerPhone: '9876543211',
    restaurantId: 'rest1',
    restaurantName: 'Bihari Kitchen',
    deliveryPartnerId: 'delivery1',
    deliveryPartnerName: 'Vijay Singh',
    items: [
      {
        productId: 'food2',
        name: 'Thali Special',
        price: 180,
        quantity: 2,
        total: 360
      },
      {
        productId: 'food3',
        name: 'Chicken Curry',
        price: 220,
        quantity: 1,
        total: 220
      }
    ],
    subtotal: 580,
    deliveryFee: 40,
    tax: 29,
    discount: 0,
    total: 649,
    paymentMethod: 'cash',
    status: 'delivered',
    statusUpdates: [
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        updatedBy: 'admin1',
        message: 'Order confirmed'
      },
      {
        status: 'preparing',
        timestamp: new Date(Date.now() - 84600000), // 23.5 hours ago
        updatedBy: 'restaurant1',
        message: 'Food preparation started'
      },
      {
        status: 'packed',
        timestamp: new Date(Date.now() - 82800000), // 23 hours ago
        updatedBy: 'restaurant1',
        message: 'Order packed and ready for pickup'
      },
      {
        status: 'out_for_delivery',
        timestamp: new Date(Date.now() - 81000000), // 22.5 hours ago
        updatedBy: 'delivery1',
        message: 'Order picked up for delivery'
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 79200000), // 22 hours ago
        updatedBy: 'delivery1',
        message: 'Order delivered successfully'
      }
    ],
    deliveryAddress: {
      fullAddress: '123, New Colony',
      landmark: 'Near Bus Stand',
      city: 'Patna',
      pincode: '800001'
    },
    orderDate: new Date(Date.now() - 86400000), // 1 day ago
    deliveryDate: new Date(Date.now() - 79200000), // 22 hours ago
    isAssigned: true
  },
  {
    id: 'order2',
    customerId: 'customer1',
    customerName: 'Rahul Kumar',
    customerPhone: '9876543211',
    restaurantId: 'rest2',
    restaurantName: 'Litti Express',
    deliveryPartnerId: 'delivery1',
    deliveryPartnerName: 'Vijay Singh',
    items: [
      {
        productId: 'food1',
        name: 'Litti Chokha',
        price: 120,
        quantity: 3,
        total: 360
      }
    ],
    subtotal: 360,
    deliveryFee: 30,
    tax: 18,
    discount: 0,
    total: 408,
    paymentMethod: 'upi',
    status: 'on_the_way',
    statusUpdates: [
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        updatedBy: 'admin1',
        message: 'Order confirmed'
      },
      {
        status: 'preparing',
        timestamp: new Date(Date.now() - 2700000), // 45 mins ago
        updatedBy: 'restaurant2',
        message: 'Food preparation started'
      },
      {
        status: 'packed',
        timestamp: new Date(Date.now() - 1800000), // 30 mins ago
        updatedBy: 'restaurant2',
        message: 'Order packed and ready for pickup'
      },
      {
        status: 'out_for_delivery',
        timestamp: new Date(Date.now() - 900000), // 15 mins ago
        updatedBy: 'delivery1',
        message: 'Order picked up for delivery'
      },
      {
        status: 'on_the_way',
        timestamp: new Date(Date.now() - 600000), // 10 mins ago
        updatedBy: 'delivery1',
        message: 'On the way to customer'
      }
    ],
    deliveryAddress: {
      fullAddress: '123, New Colony',
      landmark: 'Near Bus Stand',
      city: 'Patna',
      pincode: '800001'
    },
    orderDate: new Date(Date.now() - 3600000), // 1 hour ago
    isAssigned: true
  }
];

// Mock Offers
export const mockOffers: Offer[] = [
  {
    id: "offer1",
    title: "Welcome Offer",
    code: "WELCOME50",
    description: "Get 50% off on your first order",
    discountType: "percentage",
    discountValue: 50,
    minOrderValue: 300,
    maxDiscount: 150,
    validFrom: new Date(2023, 0, 1),
    validTo: new Date(2025, 11, 31),
    isActive: true,
    usageCount: 45
  },
  {
    id: "offer2",
    title: "Weekend Special",
    code: "WEEKEND20",
    description: "Get 20% off on your weekend orders",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 500,
    maxDiscount: 200,
    validFrom: new Date(2023, 0, 1),
    validTo: new Date(2025, 11, 31),
    isActive: true,
    usageCount: 120
  },
  {
    id: "offer3",
    title: "Flat Rs. 100 Off",
    code: "FLAT100",
    description: "Get flat Rs. 100 off on your order",
    discountType: "fixed",
    discountValue: 100,
    minOrderValue: 400,
    validFrom: new Date(2023, 0, 1),
    validTo: new Date(2025, 11, 31),
    isActive: true,
    usageCount: 75
  },
  {
    id: "offer4",
    title: "Summer Special",
    code: "SUMMER25",
    description: "Get 25% off on your order",
    discountType: "percentage",
    discountValue: 25,
    minOrderValue: 600,
    maxDiscount: 250,
    validFrom: new Date(2023, 3, 1), // April 1
    validTo: new Date(2023, 6, 31), // July 31
    isActive: false,
    usageCount: 210
  }
];

// Helper to get all products (food + grocery)
export const getAllProducts = (): Product[] => {
  return [...foodItems, ...groceryItems];
};

// Helper to filter products by category
export const getProductsByCategory = (category: string): Product[] => {
  return getAllProducts().filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

// Helper to filter products by restaurant
export const getProductsByRestaurant = (restaurantId: string): Product[] => {
  return foodItems.filter(product => product.restaurantId === restaurantId);
};

// Helper to search products
export const searchProducts = (query: string): Product[] => {
  query = query.toLowerCase();
  return getAllProducts().filter(product => 
    product.name.toLowerCase().includes(query) || 
    product.description.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );
};

// Helper to get orders by customer
export const getOrdersByCustomer = (customerId: string): Order[] => {
  return mockOrders.filter(order => order.customerId === customerId);
};

// Helper to get orders by restaurant
export const getOrdersByRestaurant = (restaurantId: string): Order[] => {
  return mockOrders.filter(order => order.restaurantId === restaurantId);
};

// Helper to get orders by delivery partner
export const getOrdersByDeliveryPartner = (deliveryPartnerId: string): Order[] => {
  return mockOrders.filter(order => order.deliveryPartnerId === deliveryPartnerId);
};
