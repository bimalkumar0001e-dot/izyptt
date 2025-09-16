import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, MapPin, Copy } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { AddressList } from '@/components/AddressList';
import { OrderSummary } from '@/components/OrderSummary';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { PromoCodeInput } from '@/components/PromoCodeInput';
import { UserAddress } from '@/types/user';
import { Offer } from '@/types/product';
import { PaymentMethod as PaymentMethodType } from '@/types/paymentMethod';
import { mockOffers } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

type CheckoutStep = 'address' | 'payment' | 'confirmation';
type PaymentMethod = 'cash' | 'upi' | 'online';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { cart, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
  const [paymentMethodModal, setPaymentMethodModal] = useState<PaymentMethodType | null>(null);
  const [siteStatus, setSiteStatus] = useState<string>('online');
  const isSiteDisabled = siteStatus === 'offline' || siteStatus === 'maintenance';
  
  // --- Delivery Time Rule Fetch ---
  // Helper to check if selected address is missing distance
  const getSelectedAddress = (): UserAddress | undefined => {
    return user?.address?.find((addr: any) =>
      (addr.id || addr._id)?.toString() === selectedAddressId?.toString()
    );
  };
  const selectedAddress = getSelectedAddress();
  const [deliveryTimeRule, setDeliveryTimeRule] = useState<{title:string,minDistance:number,maxDistance:number,minTime:number,maxTime:number}|null>(null);
  useEffect(() => {
    if (!selectedAddress || typeof selectedAddress.distance !== 'number') {
      setDeliveryTimeRule(null);
      return;
    }
    const fetchDeliveryTimeRule = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/delivery-times`);
        const rules = await res.json();
        if (Array.isArray(rules)) {
          const dist = Number(selectedAddress.distance);
          const rule = rules.find((r:any) => dist >= r.minDistance && dist <= r.maxDistance);
          setDeliveryTimeRule(rule || null);
        }
      } catch { setDeliveryTimeRule(null); }
    };
    fetchDeliveryTimeRule();
  }, [selectedAddressId, selectedAddress?.distance]);

  // Redirect if not authenticated or blocked/inactive
  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load
    if (!isAuthenticated || (user && (String(user.status) === 'inactive' || String(user.status) === 'blocked'))) {
      navigate('/login');
      return;
    }
    if (cart.items.length === 0) {
      navigate('/');
      return;
    }
    
    // Set default address if available
    if (user?.address && user.address.length > 0) {
      const defaultAddress = user.address.find((addr: any) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId((defaultAddress.id || defaultAddress._id)?.toString());
      } else if (user.address[0]) {
        setSelectedAddressId((user.address[0].id || user.address[0]._id)?.toString());
      }
    }
  }, [isAuthenticated, isLoading, cart.items.length, user?.address, user?.status, navigate]);

  // Fetch active payment methods from backend
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/customer/payment-methods`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setPaymentMethods(data);
        // Set default selected payment method if not set
        if (data.length > 0 && !paymentMethod) {
          setPaymentMethod(data[0].code);
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchPaymentMethods();
  // eslint-disable-next-line
  }, [/* ...existing deps... */]);

  // Fetch site status
  useEffect(() => {
    fetch(`${API_BASE}/admin/system-status`)
      .then(res => res.json())
      .then(data => setSiteStatus(data.status || 'online'))
      .catch(() => setSiteStatus('online'));
  }, [isAuthenticated, cart.items.length, user?.address, user?.status, navigate]);

  const handleApplyPromoCode = async (code: string): Promise<Offer | null> => {
    try {
      // Make an actual API call to validate the promo code
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/customer/offers/validate?code=${code}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Cannot apply promo code",
          description: errorData.message || "Invalid or expired promo code",
          variant: "destructive",
        });
        return null;
      }
      
      const data = await response.json();
      const offer = data.offer;
      
      // Check if minimum order value is met
      if (offer.minOrderValue && cart.subtotal < offer.minOrderValue) {
        toast({
          title: "Cannot apply promo code",
          description: `Minimum order value is ₹${offer.minOrderValue}`,
          variant: "destructive",
        });
        return null;
      }
      
      setAppliedOffer(offer);
      toast({
        title: "Promo code applied",
        description: offer.title,
      });
      return offer;
    } catch (err) {
      console.error("Error validating promo code:", err);
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleClearPromoCode = () => {
    setAppliedOffer(null);
    toast({
      title: "Promo code removed"
    });
  };

  // Helper to check if selected address is missing distance
  const isAddressMissingDistance = selectedAddress && (selectedAddress.distance === undefined || selectedAddress.distance === null || isNaN(Number(selectedAddress.distance)));

  const handleContinueToPayment = () => {
    if (!selectedAddressId) {
      toast({
        title: "Please select an address",
        description: "You need to select a delivery address to continue",
        variant: "destructive",
      });
      return;
    }
    if (isAddressMissingDistance) {
      toast({
        title: "Address expired",
        description: "This address is missing distance data. Please add a new address.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep('payment');
  };

  const cartItems = cart.items.map(item => ({
    productId: item.product.id || item.product._id,
    name: item.product.name,
    price: item.product.discountedPrice || item.product.price,
    quantity: item.quantity,
    total: (item.product.discountedPrice || item.product.price) * item.quantity
  }));

  const anyUnavailable = cart.items.some(item => item.product && item.product.isAvailable === false);

  const handlePlaceOrder = async () => {
    if (isSiteDisabled) {
      toast({
        title: "Site is currently unavailable",
        description: siteStatus === 'offline'
          ? "We are offline. Please try again later."
          : "Maintenance in progress. Please try again soon.",
        variant: "destructive",
      });
      return;
    }
    if (anyUnavailable) {
      toast({
        title: "Unavailable product in cart",
        description: "One or more products in your cart are currently unavailable. Please remove them to place your order.",
        variant: "destructive",
      });
      return;
    }
    if (isAddressMissingDistance) {
      toast({
        title: "Address expired",
        description: "This address is missing distance data. Please add a new address.",
        variant: "destructive",
      });
      return;
    }
    setIsPlacingOrder(true);
    try {
      // Gather order data
      const address = getSelectedAddress();
      if (!address) {
        toast({
          title: "Please select an address",
          description: "You need to select a delivery address to continue",
          variant: "destructive",
        });
        setIsPlacingOrder(false);
        return;
      }
      
      console.log("Preparing order payload...");
      
      // Prepare order payload
      const orderPayload = {
        items: cart.items.map(item => ({
          productId: item.product.id || item.product._id,
          name: item.product.name,
          price: item.product.discountedPrice || item.product.price,
          quantity: item.quantity,
          total: (item.product.discountedPrice || item.product.price) * item.quantity
        })),
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee || 0,
        tax: cart.tax || 0,
        discount: appliedOffer ? appliedOffer.discountValue : 0,
        total: cart.total,
        paymentMethod, // <-- this is now the code, e.g. "cash", "upi", "online"
        deliveryAddress: {
          _id: address._id, // <-- include address _id for backend matching
          address: address.fullAddress || 'Unknown Address',
          landmark: address.landmark || '',
          city: address.city,
          state: (address as any).state || 'Bihar',
          pincode: address.pincode,
          distance: address.distance
        },
        appliedOffer: appliedOffer ? appliedOffer.code : undefined
      };
      
      console.log("Order payload:", orderPayload);
      
      // Send to backend
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/customer/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        console.error("Order placement failed:", errData);
        throw new Error(errData.message || 'Order placement failed');
      }
      
      const data = await res.json();
      const orderId = data.order?._id || data.order?.id || data.orderId;
      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: `Your order ID is ${orderId}`,
      });
      
      // Redirect to order confirmation with successful sound effect
      navigate(`/order-confirmation/${orderId}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Add copy handler for payment details
  const handleCopyDetails = (details?: string) => {
    if (!details) return;
    navigator.clipboard.writeText(details);
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard.",
    });
  };

  // Helper function to determine title from address object (add this near the top of the component)
  const getAddressTitle = (address: any): string => {
    if (!address) return "Address";
    return address.title || 
           (address.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : "Address");
  };

  return (
    <div className="app-container">
      <AppHeader title="Checkout" showBackButton />
      
      <div className="flex-1 p-4 pb-20">
        {/* Steps indicator */}
        <div className="flex justify-between mb-5">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'address' ? 'bg-app-primary text-white' : 'bg-app-primary text-white'
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs mt-1 font-medium">Address</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center mt-4">
            <div className={`h-0.5 w-full ${
              currentStep === 'address' ? 'bg-gray-300' : 'bg-app-primary'
            }`} />
          </div>
          
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'payment' || currentStep === 'confirmation' 
                ? 'bg-app-primary text-white' 
                : 'bg-gray-300 text-gray-500'
            }`}>
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs mt-1 font-medium">Payment</span>
          </div>
        </div>
        
        {currentStep === 'address' && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Delivery Address</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/addresses/add')}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Button>
              </div>
              
              <AddressList 
                addresses={user?.address || []}
                selectedAddressId={selectedAddressId}
                onAddressSelect={id => setSelectedAddressId(id.toString())}
              />
            </div>
            
            {/* Show delivery time in address step if available */}
            {currentStep === 'address' && deliveryTimeRule && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">Estimated Delivery Time:</span>
                <span className="text-sm font-bold text-indigo-700">{deliveryTimeRule.minTime}-{deliveryTimeRule.maxTime} minutes</span>
              </div>
            )}
            
            <Separator />
            
            <div>
              <OrderSummary 
                cart={cart} 
                appliedOffer={appliedOffer}
                addressDistance={getSelectedAddress()?.distance}
              />
            </div>
            
            <Separator />
            
            <div>
              <OrderSummary 
                cart={cart} 
                appliedOffer={appliedOffer}
                addressDistance={getSelectedAddress()?.distance}
              />
            </div>

            {/* Cancellation Policy Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mt-4">
              <h3 className="text-base font-semibold mb-1">Cancellation Policy</h3>
              <p className="text-gray-600 text-sm">
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable. For more details, please refer to our Return and Replacement Policy.
              </p>
            </div>
            
            <Button 
              onClick={handleContinueToPayment}
              className="w-full bg-app-primary hover:bg-app-primary/90"
            >
              Continue to Payment
            </Button>
          </div>
        )}
        
        {currentStep === 'payment' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Selected Address</h2>
              
              {getSelectedAddress() && (
                <div className="p-4 rounded-xl border border-app-primary bg-app-secondary/10">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-app-primary mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{getSelectedAddress()?.title || getAddressTitle(getSelectedAddress())}</p>
                      <p className="text-sm text-gray-600">
                        {getSelectedAddress()?.fullAddress || "No address specified"}
                      </p>
                      {getSelectedAddress()?.landmark && (
                        <p className="text-sm text-gray-600">
                          Landmark: {getSelectedAddress()?.landmark}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {getSelectedAddress()?.city || "City not specified"}, 
                        {(getSelectedAddress() as any)?.state && ` ${(getSelectedAddress() as any).state},`} 
                        {getSelectedAddress()?.pincode || "Pincode not specified"}
                      </p>
                      {getSelectedAddress()?.distance !== undefined && getSelectedAddress()?.distance !== null && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Distance:</span> {getSelectedAddress()?.distance} km
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentStep('address')}
                className="mt-2 text-app-primary"
              >
                Change Address
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Promo Code</h2>
              <PromoCodeInput 
                onApply={handleApplyPromoCode} 
                onClear={handleClearPromoCode}
                appliedOffer={appliedOffer}
              />
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Payment Method</h2>
              <PaymentMethodSelector 
                selectedMethod={paymentMethod}
                onMethodSelect={setPaymentMethod}
                paymentMethods={paymentMethods}
                onMethodClick={setPaymentMethodModal} // <-- pass modal open handler
              />
            </div>
            
            <Separator />
            {/* Show original delivery time as per admin rule for selected address */}
            {deliveryTimeRule && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">Estimated Delivery Time:</span>
                <span className="text-sm font-bold text-indigo-700">{deliveryTimeRule.minTime}-{deliveryTimeRule.maxTime} minutes</span>
              </div>
            )}
            <Separator />
            <OrderSummary 
              cart={cart} 
              appliedOffer={appliedOffer}
              addressDistance={selectedAddress?.distance}
            />

            <Button 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || isSiteDisabled || anyUnavailable}
              className="w-full bg-app-primary hover:bg-app-primary/90"
            >
              {anyUnavailable
                ? "Unavailable item in cart"
                : isPlacingOrder
                  ? 'Processing...'
                  : 'Place Order'}
            </Button>
          </div>
        )}
      </div>
      {/* Payment Method Details Modal */}
      <Dialog open={!!paymentMethodModal} onOpenChange={open => !open && setPaymentMethodModal(null)}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>
              {paymentMethodModal?.name}
            </DialogTitle>
            <DialogDescription>
              {paymentMethodModal?.description}
            </DialogDescription>
          </DialogHeader>
          {paymentMethodModal?.image && (
            <div className="flex justify-center my-4">
              <img
                src={
                  paymentMethodModal.image.startsWith('/uploads/')
                    ? `${BACKEND_URL}${paymentMethodModal.image}`
                    : paymentMethodModal.image
                }
                alt={paymentMethodModal.name}
                className="w-32 h-32 object-contain rounded" // Larger and rounded
              />
            </div>
          )}
          {paymentMethodModal?.details && (
            <div className="mb-2 flex items-center">
              <strong className="mr-2">Details:</strong>
              <span className="text-sm text-gray-700 whitespace-pre-line">{paymentMethodModal.details}</span>
              <button
                className="ml-2 p-1 rounded hover:bg-gray-200"
                title="Copy UPI ID"
                onClick={() => handleCopyDetails(paymentMethodModal.details)}
                type="button"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
          {paymentMethodModal?.paymentGuide && (
            <div className="mb-2">
              <strong>Payment Guide:</strong>
              <div className="text-sm text-gray-700 whitespace-pre-line">{paymentMethodModal.paymentGuide}</div>
            </div>
          )}
          {paymentMethodModal?.instructions && (
            <div className="mb-2">
              <strong>Instructions:</strong>
              <div className="text-sm text-gray-700 whitespace-pre-line">{paymentMethodModal.instructions}</div>
            </div>
          )}
          <DialogClose asChild>
            <button className="mt-2 px-4 py-2 bg-app-primary text-white rounded">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
