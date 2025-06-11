import React, { useEffect, useState } from 'react';
import { Cart, Offer } from '@/types/product';
import { Separator } from '@/components/ui/separator';
import { BACKEND_URL } from '@/utils/utils';

interface OrderSummaryProps {
  cart: Cart;
  appliedOffer?: Offer;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  appliedOffer
}) => {
  const [adminDeliveryFees, setAdminDeliveryFees] = useState<any[] | null>(null);
  const [adminHandlingCharge, setAdminHandlingCharge] = useState<number | null>(null);
  const [adminGstTax, setAdminGstTax] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/delivery-fee`)
      .then(res => res.json())
      .then((fees) => {
        // Save all delivery fees for range selection
        setAdminDeliveryFees(Array.isArray(fees) ? fees.filter((fee: any) => fee.isActive) : []);
      })
      .catch(() => setAdminDeliveryFees([]));

    fetch(`${BACKEND_URL}/api/admin/handling-charge`)
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
    fetch(`${BACKEND_URL}/api/admin/gst-taxes`)
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

  // Select delivery fee based on cart subtotal and fee ranges
  function getDeliveryFee(subtotal: number): number {
    if (!adminDeliveryFees) return 0;
    // Sort by minSubtotal ascending to ensure correct match for overlapping ranges
    const sortedFees = [...adminDeliveryFees].sort(
      (a, b) => (a.minSubtotal ?? 0) - (b.minSubtotal ?? 0)
    );
    const fee = sortedFees.find((fee: any) => {
      const min = typeof fee.minSubtotal === 'number' ? fee.minSubtotal : 0;
      const max = typeof fee.maxSubtotal === 'number' ? fee.maxSubtotal : Infinity;
      return subtotal >= min && subtotal <= max;
    });
    return fee ? fee.amount : 0;
  }

  const offerDiscount = appliedOffer ? calculateOfferDiscount(cart.subtotal, appliedOffer) : 0;
  const deliveryFeeToShow = adminDeliveryFees !== null ? getDeliveryFee(cart.subtotal) : cart.deliveryFee;
  const handlingChargeToShow = adminHandlingCharge !== null ? adminHandlingCharge : 0;
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
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
      </div>
      <div className="space-y-2 border-b border-gray-100 pb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-600">₹{cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span>
            {adminDeliveryFees === null
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
        <span className="text-black">Total</span>
        <span>
          {adminDeliveryFees === null || adminHandlingCharge === null || adminGstTax === null
            ? <span className="text-gray-400">Loading...</span>
            : <span className="font-bold text-app-primary">₹{total.toFixed(2)}</span>
          }
        </span>
      </div>
    </div>
  );
};
