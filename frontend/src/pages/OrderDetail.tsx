
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, Clock, Package } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { OrderStatusBar } from '@/components/OrderStatusBar';
import { OrderRating } from '@/components/OrderRating';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatusUpdate } from '@/types/order';
import { mockOrders } from '@/data/mockData';
import { format } from 'date-fns';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRated, setHasRated] = useState(false);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (id) {
      // Find the order with matching ID
      const foundOrder = mockOrders.find(o => o.id === id) || null;
      setOrder(foundOrder);
      setIsLoading(false);
    }
  }, [id, navigate, isAuthenticated]);

  // Simulate real-time order tracking with a mock update every 30 seconds
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'canceled') {
      return;
    }
    
    const updateInterval = setInterval(() => {
      // Simulate status updates for demo purposes
      const statusFlow: { [key: string]: string } = {
        'pending': 'confirmed',
        'confirmed': 'preparing',
        'preparing': 'packed',
        'packed': 'out_for_delivery',
        'out_for_delivery': 'delivered'
      };
      
      setOrder(prevOrder => {
        if (!prevOrder) return null;
        
        const nextStatus = statusFlow[prevOrder.status];
        if (!nextStatus) return prevOrder;
        
        const newStatusUpdate: OrderStatusUpdate = {
          status: nextStatus as any,
          timestamp: new Date(),
          updatedBy: 'system',
          message: `Order ${nextStatus.replace('_', ' ')}`
        };
        
        return {
          ...prevOrder,
          status: nextStatus as any,
          statusUpdates: [...prevOrder.statusUpdates, newStatusUpdate]
        };
      });
    }, 30000); // Update every 30 seconds for demo
    
    return () => clearInterval(updateInterval);
  }, [order]);
  
  const formatDate = (date: Date) => {
    return format(date, 'PPpp'); // Format: "Apr 29, 2023, 1:25 PM"
  };
  
  const handleRatingSubmit = async (rating: number, review: string) => {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Rating submitted successfully",
      description: "Thank you for your feedback!"
    });
    
    setHasRated(true);
  };
  
  if (isLoading) {
    return (
      <div className="app-container">
        <AppHeader title="Order Details" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="app-container">
        <AppHeader title="Order Details" showBackButton />
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <p className="text-xl font-semibold">Order not found</p>
          <button 
            onClick={() => navigate('/orders')} 
            className="mt-4 px-4 py-2 bg-app-primary text-white rounded-lg"
          >
            Go back to Orders
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <AppHeader title={`Order #${order.id.substring(0, 8)}`} showBackButton />
      
      <div className="flex-1 p-4 pb-6">
        <div className="app-card mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">Order Status</h2>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              order.status === 'delivered' 
                ? 'bg-green-100 text-green-700'
                : order.status === 'canceled'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <OrderStatusBar currentStatus={order.status} className="mt-4" />
        </div>
        
        <div className="app-card mb-4">
          <h2 className="font-semibold mb-3">Order Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date</span>
              <span>{formatDate(order.orderDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            {order.deliveryDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Date</span>
                <span>{formatDate(order.deliveryDate)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="app-card mb-4">
          <h2 className="font-semibold mb-3">Restaurant</h2>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-app-secondary rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-app-primary" />
            </div>
            <div className="ml-3">
              <h3 className="font-medium">{order.restaurantName || 'Multiple Vendors'}</h3>
              <p className="text-sm text-gray-500">ID: {order.restaurantId || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="app-card mb-4">
          <h2 className="font-semibold mb-3">Delivery Details</h2>
          
          {order.deliveryPartnerName ? (
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium">{order.deliveryPartnerName}</h3>
                <p className="text-sm text-gray-500">Delivery Partner</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mb-3">Not assigned yet</p>
          )}
          
          <Separator className="my-3" />
          
          <div className="flex items-start mt-3">
            <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-1" />
            <div>
              <h3 className="font-medium">Delivery Address</h3>
              <p className="text-gray-600">{order.deliveryAddress.fullAddress}</p>
              <p className="text-gray-600">
                {order.deliveryAddress.landmark && `${order.deliveryAddress.landmark}, `}
                {order.deliveryAddress.city}, {order.deliveryAddress.pincode}
              </p>
            </div>
          </div>
          
          <div className="flex items-center mt-3">
            <Phone className="w-5 h-5 text-gray-500 mr-2" />
            <div>
              <h3 className="font-medium">Contact Number</h3>
              <p className="text-gray-600">{order.customerPhone}</p>
            </div>
          </div>
        </div>
        
        <div className="app-card mb-4">
          <h2 className="font-semibold mb-3">Order Items</h2>
          
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span className="font-medium">₹{item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>₹{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <Separator className="my-3" />
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="app-card mb-4">
          <h2 className="font-semibold mb-3">Status Updates</h2>
          
          <div className="space-y-4">
            {[...order.statusUpdates].reverse().map((update, index) => (
              <div key={index} className="flex">
                <div className="mr-3 relative">
                  <div className="w-3 h-3 rounded-full bg-app-primary"></div>
                  {index !== order.statusUpdates.length - 1 && (
                    <div className="absolute top-3 bottom-0 left-1.5 w-0.5 -ml-px bg-gray-200"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {update.status.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(update.timestamp)}
                  </p>
                  {update.message && (
                    <p className="text-sm mt-1">{update.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rating section - only show for delivered orders */}
        {order.status === 'delivered' && !hasRated && (
          <div className="app-card">
            <OrderRating 
              orderId={order.id} 
              onSubmit={handleRatingSubmit} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
