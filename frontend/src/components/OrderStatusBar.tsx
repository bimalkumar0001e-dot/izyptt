
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

interface OrderStatusBarProps {
  currentStatus: OrderStatus;
  className?: string;
}

const statusSteps: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'packed',
  'out_for_delivery',
  'on_the_way',
  'heavy_traffic',
  'weather_delay',
  'delivered'
];

const statusLabels: Record<OrderStatus, string> = {
  'pending': 'Pending',
  'confirmed': 'Confirmed',
  'preparing': 'Preparing',
  'packed': 'Packed',
  'out_for_delivery': 'Out for Delivery',
  'on_the_way': 'On the Way',
  'delivered': 'Delivered',
  'canceled': 'Canceled',
  'heavy_traffic': 'Heavy Traffic',
  'weather_delay': 'Weather Delay'
};

export const OrderStatusBar: React.FC<OrderStatusBarProps> = ({ currentStatus, className }) => {
  if (currentStatus === 'canceled') {
    return (
      <div className={cn("p-3 bg-red-50 rounded-lg", className)}>
        <p className="text-center text-red-600">Order has been canceled</p>
      </div>
    );
  }
  
  const currentIndex = statusSteps.findIndex(step => step === currentStatus);
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative flex justify-between items-center">
        {statusSteps.slice(0, 5).map((step, index) => {
          const isActive = index <= currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div 
              key={step}
              className={cn(
                "flex flex-col items-center z-10",
                {
                  "text-app-primary": isActive,
                  "text-gray-400": !isActive
                }
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                {
                  "bg-app-primary text-white": isActive,
                  "bg-gray-200": !isActive
                }
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs mt-1 text-center">{statusLabels[step]}</span>
            </div>
          );
        })}
        
        {/* Progress bar */}
        <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-200 -z-0">
          <div 
            className="h-full bg-app-primary transition-all duration-500"
            style={{ width: `${(Math.min(currentIndex, 4) / 4) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
