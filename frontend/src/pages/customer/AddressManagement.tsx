import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash, Check } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserAddress } from '@/types/user';
import { BottomNav } from '@/components/BottomNav';

const AddressManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchAddresses, addAddress, updateAddress, deleteAddress, isAuthenticated, isLoading } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;
    if (isAuthenticated === false) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'customer') {
      navigate('/login');
      return;
    }
    fetchAddresses().then(() => {
      setAddresses(user?.address || []);
    });
    // eslint-disable-next-line
  }, [user, isAuthenticated, isLoading]);

  // Show loading spinner while auth is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  const handleSetDefault = async (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    // Find the address to update
    const addr = addresses.find(a => a.id === addressId);
    if (addr) {
      await updateAddress(addressId, { ...addr, isDefault: true });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    await deleteAddress(addressId);
  };
  
  // Helper function to determine title from address object
  const getAddressTitle = (address: any): string => {
    // Use title if it exists, otherwise use type, or fallback to "Address"
    return address.title || 
           (address.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : "Address");
  };

  return (
    <div className="app-container">
      <AppHeader title="Manage Addresses" showBackButton />
      <div className="flex-1 p-4 pb-40 relative">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1">Your Saved Addresses</h2>
          <p className="text-gray-600 text-sm">
            Manage your delivery locations for faster checkout
          </p>
        </div>
        {user?.address?.length > 0 ? (
          <div className="space-y-4">
            {user.address.map((address: any) => (
              <div 
                key={address._id}
                className={`p-4 rounded-xl border ${address.isDefault ? 'border-app-primary bg-app-secondary/10' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <MapPin className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${address.isDefault ? 'text-app-primary' : 'text-gray-500'}`} />
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{getAddressTitle(address)}</p>
                        {address.isDefault && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-app-primary text-white">
                            Default
                          </span>
                        )}
                        {(address.distance === undefined || address.distance === null) && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500 text-white">
                            Expired
                          </span>
                        )}
                      </div>
                      
                      {/* Display full address */}
                      <p className="text-sm text-gray-600 mt-1">{address.address || address.fullAddress || "No address specified"}</p>
                      
                      {/* Display landmark if available */}
                      {address.landmark && (
                        <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>
                      )}
                      
                      {/* Location details */}
                      <p className="text-sm text-gray-600">
                        {address.city || "City not specified"}, 
                        {address.state && ` ${address.state},`} 
                        {address.pincode || "Pincode not specified"}
                      </p>
                      
                      {/* Display distance if available */}
                      {address.distance !== undefined && address.distance !== null && (
                        <p className="text-sm text-gray-600 mt-1">
                          Distance: {address.distance} km
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-app-primary border-app-primary"
                      onClick={() => handleSetDefault(address._id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/addresses/edit/${address._id}`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500"
                    onClick={() => handleDeleteAddress(address._id)}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-lg mb-1">No addresses saved yet</h3>
            <p className="text-gray-600 mb-4">Add an address to save time during checkout</p>
          </div>
        )}
        {/* Place the Add New Address button inside the scrollable area, at the bottom, styled to match the card layout */}
        <div className="sticky bottom-20 mt-8">
          <Button
            className="w-full bg-app-primary hover:bg-app-primary/90 rounded-xl shadow font-semibold text-base"
            onClick={() => navigate('/addresses/add')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Address
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default AddressManagement;
