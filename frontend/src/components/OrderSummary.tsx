import React, { useEffect, useState } from 'react';
import { Cart, Offer } from '@/types/product';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
  cart: Cart;
  appliedOffer?: Offer;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  appliedOffer
}) => {
  const [adminDeliveryFee, setAdminDeliveryFee] = useState<number | null>(null);
  const [adminHandlingCharge, setAdminHandlingCharge] = useState<number | null>(null);
  const [adminGstTax, setAdminGstTax] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/admin/delivery-fee')
      .then(res => res.json())
      .then((fees) => {
        const activeFee = Array.isArray(fees)
          ? fees.find((fee: any) => fee.isActive)
          : null;
        if (activeFee) setAdminDeliveryFee(activeFee.amount);
        else setAdminDeliveryFee(0);
      })
      .catch(() => setAdminDeliveryFee(0));

    fetch('http://localhost:5001/api/admin/handling-charge')
      .then(res => res.json())
      .then((charges) => {
        const activeCharge = Array.isArray(charges)
          ? charges.find((charge: any) => charge.isActive)
          : null;
        if (activeCharge) setAdminHandlingCharge(activeCharge.amount);
        else setAdminHandlingCharge(0);
      })
      .catch(() => setAdminHandlingCharge(0));

    // Fetch GST/tax set by admin
    fetch('http://localhost:5001/api/admin/gst-taxes')
      .then(res => res.json())
      .then((taxes) => {
        const activeTax = Array.isArray(taxes)
          ? taxes.find((tax: any) => tax.isActive)
          : null;
        if (activeTax) setAdminGstTax(activeTax.percentage || activeTax.amount || 0);
        else setAdminGstTax(0);
      })
      .catch(() => setAdminGstTax(0));
  }, []);

  const offerDiscount = appliedOffer ? calculateOfferDiscount(cart.subtotal, appliedOffer) : 0;
  const deliveryFeeToShow = adminDeliveryFee !== null ? adminDeliveryFee : cart.deliveryFee;
  const handlingChargeToShow = adminHandlingCharge !== null ? adminHandlingCharge : 0;
  // GST/tax: use adminGstTax as percentage (e.g. 5 for 5%)
  const gstTaxToShow = adminGstTax !== null ? (cart.subtotal * adminGstTax / 100) : cart.tax;
  const total = cart.subtotal + deliveryFeeToShow + gstTaxToShow + handlingChargeToShow - offerDiscount;

  function calculateOfferDiscount(subtotal: number, offer: Offer): number {
    if (!offer) return 0;
    if (offer.discountType === 'percentage') {
      const discount = (subtotal * offer.discountValue) / 100;
      return offer.maxDiscount ? Math.min(discount, offer.maxDiscount) : discount;
    } else {
      return offer.discountValue;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
      
      <div className="space-y-2 border-b border-gray-100 pb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>₹{cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span>
            {adminDeliveryFee === null
              ? <span className="text-gray-400">Loading...</span>
              : <>₹{deliveryFeeToShow.toFixed(2)}</>
            }
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">
            Tax{adminGstTax !== null ? ` (${adminGstTax}%)` : ''}
          </span>
          <span>
            {adminGstTax === null
              ? <span className="text-gray-400">Loading...</span>
              : <>₹{gstTaxToShow.toFixed(2)}</>
            }
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Handling Charge</span>
          <span>
            {adminHandlingCharge === null
              ? <span className="text-gray-400">Loading...</span>
              : <>₹{handlingChargeToShow.toFixed(2)}</>
            }
          </span>
        </div>
        {appliedOffer && (
          <div className="flex justify-between">
            <span className="text-green-600">Discount ({appliedOffer.code})</span>
            <span className="text-green-600">-₹{offerDiscount.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-3 font-semibold text-lg">
        <span>Total</span>
        <span>
          {adminDeliveryFee === null || adminHandlingCharge === null || adminGstTax === null
            ? <span className="text-gray-400">Loading...</span>
            : <>₹{total.toFixed(2)}</>
          }
        </span>
      </div>
    </div>
  );
};
