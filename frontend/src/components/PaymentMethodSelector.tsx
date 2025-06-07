import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PaymentMethod as PaymentMethodType } from '@/types/paymentMethod'; // (create this type if not present)
import { Copy } from 'lucide-react'; // add this import
import { useToast } from '@/hooks/use-toast'; // add this import

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  paymentMethods: PaymentMethodType[];
  onMethodClick?: (method: PaymentMethodType) => void; // <-- add prop
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  paymentMethods,
  onMethodClick
}) => {
  const { toast } = useToast();

  const handleCopyDetails = (details?: string) => {
    if (!details) return;
    navigator.clipboard.writeText(details);
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard.",
    });
  };

  return (
    <RadioGroup value={selectedMethod} onValueChange={onMethodSelect} className="space-y-3">
      {paymentMethods.map((method) => (
        <Label
          key={method.id || method.code || method.name}
          htmlFor={method.code}
          className={`flex items-start p-4 rounded-xl border cursor-pointer transition-colors ${
            selectedMethod === method.code
              ? 'border-app-primary bg-app-secondary/10'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={e => {
            // Prevent double firing when clicking radio
            if (onMethodClick) onMethodClick(method);
          }}
        >
          <RadioGroupItem
            value={method.code}
            id={method.code}
            className="mr-3 mt-1"
            onClick={e => e.stopPropagation()} // Prevent modal on radio click
          />
          <div className="flex-1">
            <div className="flex items-center">
              {/* Truck SVG icon */}
              <span className="w-5 h-5 mr-2 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="6" y="3" width="16" height="16" rx="2" stroke="#4CAF50" strokeWidth="2"/>
                  <path d="M7 25V21C7 20.4477 7.44772 20 8 20H20C20.5523 20 21 20.4477 21 21V25" stroke="#374151" strokeWidth="2"/>
                  <rect x="10" y="22" width="2" height="2" rx="1" fill="#374151"/>
                  <rect x="16" y="22" width="2" height="2" rx="1" fill="#374151"/>
                </svg>
              </span>
              <div>
                <p className="font-medium">{method.name}</p>
                {method.details && (
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">{method.details}</p>
                    <button
                      className="ml-2 p-1 rounded hover:bg-gray-200"
                      title="Copy UPI ID"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleCopyDetails(method.details);
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Label>
      ))}
    </RadioGroup>
  );
};
