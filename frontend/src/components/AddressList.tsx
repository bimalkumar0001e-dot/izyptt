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

  // Helper function to determine title from address object
  const getAddressTitle = (address: any): string => {
    return address.title || 
          (address.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : "Address");
  };

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
                  <div className="flex-1">
                    <p className="font-medium">
                      {getAddressTitle(address)}
                      {address.isDefault && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-app-primary text-white">
                          Default
                        </span>
                      )}
                      {(address.distance === undefined || address.distance === null || isNaN(Number(address.distance))) && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500 text-white">
                          Expired
                        </span>
                      )}
                    </p>
                    
                    {/* Display full address */}
                    <p className="text-sm text-gray-600 mt-1">
                      {address.fullAddress || address.address || "No address specified"}
                    </p>
                    
                    {/* Display landmark if available */}
                    {address.landmark && (
                      <p className="text-sm text-gray-600">
                        Landmark: {address.landmark}
                      </p>
                    )}
                    
                    {/* Location details */}
                    <p className="text-sm text-gray-600">
                      {address.city || "City not specified"}, 
                      {(address as any).state && ` ${(address as any).state},`} 
                      {address.pincode || "Pincode not specified"}
                    </p>
                    
                    {/* Display distance if available */}
                    {address.distance !== undefined && address.distance !== null && !isNaN(Number(address.distance)) && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Distance:</span> {address.distance} km
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Label>
          );
        })}
      </div>
    </RadioGroup>
  );
};
