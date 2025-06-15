import React, { useEffect, useState } from 'react';
import { Cart, Offer } from '@/types/product';
import { Separator } from '@/components/ui/separator';
import { BACKEND_URL } from '@/utils/utils';

interface OrderSummaryProps {
  cart: Cart;
  appliedOffer?: Offer;
  addressDistance?: number; // <-- add this prop
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  appliedOffer,
  addressDistance
}) => {
  const [deliveryFeeSections, setDeliveryFeeSections] = useState<any[] | null>(null);
  const [adminHandlingCharge, setAdminHandlingCharge] = useState<number | null>(null);
  const [adminGstTax, setAdminGstTax] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/delivery-fee-sections`)
      .then(res => res.json())
      .then((sections) => {
        setDeliveryFeeSections(Array.isArray(sections) ? sections.filter((s: any) => s.isActive !== false) : []);
      })
      .catch(() => setDeliveryFeeSections([]));

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

  // --- Delivery Fee Calculation by Distance ---
  function getDeliveryFeeByDistance(distance: number | undefined, subtotal: number): number {
    if (!deliveryFeeSections || typeof distance !== 'number') return 0;
    // Find section with km == distance (or nearest lower if not found)
    // Prefer exact match, else nearest lower, else lowest km section
    let section = deliveryFeeSections.find((s: any) => Number(s.km) === Number(distance));
    if (!section) {
      // Try nearest lower
      const sorted = [...deliveryFeeSections].sort((a, b) => a.km - b.km);
      section = sorted.reverse().find((s: any) => Number(s.km) < Number(distance));
      if (!section) section = sorted[0]; // fallback to lowest km
    }
    if (!section || !Array.isArray(section.fees)) return 0;
    // Find fee slab by subtotal
    const sortedFees = [...section.fees].sort(
      (a, b) => (a.minSubtotal ?? 0) - (b.minSubtotal ?? 0)
    );
    const fee = sortedFees.find((fee: any) => {
      const min = typeof fee.minSubtotal === 'number' ? fee.minSubtotal : 0;
      const max = typeof fee.maxSubtotal === 'number' ? fee.maxSubtotal : Infinity;
      return subtotal >= min && subtotal <= max && fee.isActive !== false;
    });
    return fee ? fee.amount : 0;
  }

  // GST calculation logic (Popular Dishes section)
  const [popularProductIds, setPopularProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch popular dish product IDs from backend
    fetch(`${BACKEND_URL}/api/admin/popular-dishes`)
      .then(res => res.json())
      .then((popularDishes) => {
        setPopularProductIds(new Set((popularDishes || []).map((p: any) => p._id || p.id)));
      })
      .catch(() => setPopularProductIds(new Set()));
  }, []);

  function getGstEligibleSubtotal(): number {
    if (!cart.items || cart.items.length === 0) return 0;
    let gstEligibleSubtotal = 0;
    let allItemsArePopular = true;
    for (const item of cart.items) {
      const productId = item.product?._id || item.product?.id;
      if (productId && popularProductIds.has(String(productId))) {
        const price = item.product.discountedPrice || item.product.price;
        gstEligibleSubtotal += price * item.quantity;
      } else {
        allItemsArePopular = false;
      }
    }
    if (allItemsArePopular && cart.items.length > 0) {
      return cart.subtotal;
    }
    return gstEligibleSubtotal;
  }

  const offerDiscount = appliedOffer ? calculateOfferDiscount(cart.subtotal, appliedOffer) : 0;
  const deliveryFeeToShow = deliveryFeeSections !== null && typeof addressDistance !== 'undefined'
    ? getDeliveryFeeByDistance(addressDistance, cart.subtotal)
    : cart.deliveryFee;
  const handlingChargeToShow = adminHandlingCharge !== null ? adminHandlingCharge : 0;
  const gstEligibleSubtotal = getGstEligibleSubtotal();
  const gstTaxToShow = adminGstTax !== null ? (gstEligibleSubtotal * adminGstTax / 100) : cart.tax;
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

  // Show error if addressDistance is missing or invalid
  const showAddressDistanceError = addressDistance === undefined || addressDistance === null || isNaN(Number(addressDistance));

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
      </div>
      {showAddressDistanceError && (
        <div className="mb-3 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          Address expired: Please add a new address with distance in km.
        </div>
      )}
      <div className="space-y-2 border-b border-gray-100 pb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-600">₹{cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span>
            {deliveryFeeSections === null
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
          {deliveryFeeSections === null || adminHandlingCharge === null || adminGstTax === null
            ? <span className="text-gray-400">Loading...</span>
            : <span className="font-bold text-app-primary">₹{total.toFixed(2)}</span>
          }
        </span>
      </div>
    </div>
  );
};
