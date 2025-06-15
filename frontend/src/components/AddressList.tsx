import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { UserAddress } from '@/types/user';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface AddressListProps {
  addresses: UserAddress[];
  selectedAddressId: string;
  onAddressSelect: (addressId: string) => void;
  name?: string;
}

export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  selectedAddressId,
  onAddressSelect,
  name = "address-list"
}) => {
  if (addresses.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-medium text-lg mb-1">No addresses saved yet</h3>
        <p className="text-gray-600 mb-4">Please add an address to continue with checkout</p>
      </div>
    );
  }

  return (
    <RadioGroup
      value={selectedAddressId?.toString() || ""}
      onValueChange={val => onAddressSelect(val)}
    >
      <div className="space-y-3">
        {addresses.map((address) => {
          const addressId = (address.id || address._id)?.toString();
          const radioId = `${name}-${addressId}`;
          const isSelected = selectedAddressId?.toString() === addressId;
          
          return (
            <Label
              key={radioId}
              htmlFor={radioId}
              className={`flex items-start p-4 rounded-xl border cursor-pointer transition-colors ${
                isSelected ? 'border-app-primary bg-app-secondary/10' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <RadioGroupItem 
                value={addressId}
                id={radioId}
                className="mr-3 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {address.title}
                      {(address.distance === undefined || address.distance === null || isNaN(Number(address.distance))) && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500 text-white">
                          Expired
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{address.fullAddress}</p>
                    {address.landmark && (
                      <p className="text-sm text-gray-600">{address.landmark}</p>
                    )}
                    <p className="text-sm text-gray-600">{address.city}, {address.pincode}</p>
                  </div>
                  {address.isDefault && (
                    <span className="text-xs px-2 py-0.5 rounded bg-app-primary text-white">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </Label>
          );
        })}
      </div>
    </RadioGroup>
  );
};
