
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Offer } from '@/types/product';

interface PromoCodeInputProps {
  onApply: (code: string) => Promise<Offer | null>;
  onClear: () => void;
  appliedOffer?: Offer | null;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  onApply,
  onClear,
  appliedOffer
}) => {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setIsChecking(true);
    setError('');
    
    try {
      const result = await onApply(code);
      if (!result) {
        setError('Invalid or expired promo code');
      }
    } catch (err) {
      setError('Error validating promo code');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      {appliedOffer ? (
        <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <p className="font-medium text-sm">{appliedOffer.code} applied</p>
              <p className="text-xs text-gray-600">{appliedOffer.title}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter promo code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleApply}
              disabled={!code.trim() || isChecking}
            >
              {isChecking ? 'Checking...' : 'Apply'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
};
