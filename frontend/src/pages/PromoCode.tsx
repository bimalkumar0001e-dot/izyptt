import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Clock, Check, AlertCircle, Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Offer } from '@/types/product';
import { PromoCodeInput } from '@/components/PromoCodeInput';
import { format } from 'date-fns';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const PromoCode: React.FC = () => {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    offer?: Offer;
  } | null>(null);

  useEffect(() => {
    // Fetch all offers from backend (admin endpoint)
    fetch(`${API_BASE}/admin/offers`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOffers(data);
        else setOffers([]);
      })
      .catch(() => setOffers([]));
  }, []);

  const activeOffers = offers.filter(offer => offer.isActive && offer.isPublic);

  const validatePromoCode = () => {
    if (!promoCode.trim()) {
      setValidationResult({
        valid: false,
        message: 'Please enter a promo code'
      });
      return;
    }

    const matchedOffer = offers.find(
      offer => offer.code.toLowerCase() === promoCode.toLowerCase()
    );

    if (!matchedOffer) {
      setValidationResult({
        valid: false,
        message: 'Invalid promo code. Please check and try again.'
      });
      return;
    }

    if (!matchedOffer.isActive) {
      setValidationResult({
        valid: false,
        message: 'This promo code has expired.'
      });
      return;
    }

    const now = new Date();
    if (now < new Date(matchedOffer.validFrom) || now > new Date(matchedOffer.validTo)) {
      setValidationResult({
        valid: false,
        message: `This promo code is valid from ${format(new Date(matchedOffer.validFrom), 'MMM dd, yyyy')} to ${format(new Date(matchedOffer.validTo), 'MMM dd, yyyy')}`
      });
      return;
    }

    setValidationResult({
      valid: true,
      message: 'Promo code applied successfully!',
      offer: matchedOffer
    });

    toast({
      title: "Success!",
      description: `Promo code ${matchedOffer.code} has been applied.`
    });
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Promo code ${code} copied to clipboard`
    });
  };

  return (
    <div className="app-container">
      <AppHeader title="Promo Codes" showBackButton />

      <div className="flex-1 p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h2 className="font-semibold mb-4">Enter Promo Code</h2>

          <div className="space-y-3">
            <PromoCodeInput 
              value={promoCode}
              onChange={setPromoCode}
              onSubmit={validatePromoCode}
            />

            {validationResult && (
              <div className={`p-3 rounded-lg ${
                validationResult.valid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  {validationResult.valid ? (
                    <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                  )}
                  <div>
                    <p className={validationResult.valid ? 'text-green-700' : 'text-red-700'}>
                      {validationResult.message}
                    </p>
                    
                    {validationResult.valid && validationResult.offer && (
                      <p className="text-sm text-green-600 mt-1">
                        {validationResult.offer.discountType === 'percentage'
                          ? `${validationResult.offer.discountValue}% off on orders above ₹${validationResult.offer.minOrderValue}`
                          : `₹${validationResult.offer.discountValue} off on orders above ₹${validationResult.offer.minOrderValue}`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Available Offers</h2>
          </div>

          <div className="space-y-4">
            {activeOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl p-4 border border-dashed border-app-primary">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-app-primary">{offer.title}</h3>
                  <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                    <span className="font-mono font-medium">{offer.code}</span>
                    <button onClick={() => copyPromoCode(offer.code)} className="p-1">
                      <Copy className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{offer.description}</p>

                <div className="flex justify-between text-xs text-gray-500 items-center">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Valid till {format(new Date(offer.validTo), 'MMM dd, yyyy')}</span>
                  </div>

                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-app-primary p-0 h-auto"
                    onClick={() => {
                      setPromoCode(offer.code);
                      validatePromoCode();
                    }}
                  >
                    Apply
                  </Button>
                </div>

                <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                  <p className="text-xs text-gray-500">
                    Min. order: ₹{offer.minOrderValue} | 
                    {offer.maxDiscount 
                      ? ` Max discount: ₹${offer.maxDiscount}`
                      : ' No maximum discount limit'
                    }
                  </p>
                </div>
              </div>
            ))}

            {activeOffers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No active offers available at the moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCode;
