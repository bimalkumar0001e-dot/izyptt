import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { UserAddress } from '@/types/user';
import { BottomNav } from '@/components/BottomNav';

const AddressForm: React.FC = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { user, addAddress, updateAddress, isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [distance, setDistance] = useState(''); // <-- add distance state

  const isEditing = Boolean(addressId);

  useEffect(() => {
    if (isEditing && user?.address) {
      const existingAddress = user.address.find((addr: any) => addr._id === addressId);
      if (existingAddress) {
        setTitle(existingAddress.title);
        setFullAddress(existingAddress.fullAddress);
        setLandmark(existingAddress.landmark || '');
        setCity(existingAddress.city);
        setPincode(existingAddress.pincode);
        setIsDefault(existingAddress.isDefault);
        setDistance(existingAddress.distance?.toString() || ''); // <-- prefill distance
      }
    }
  }, [addressId, user?.address, isEditing]);

  if (!isAuthenticated || user?.role !== 'customer') {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fullAddress || !city || !pincode || !distance) {
      setError('Please fill all required fields');
      return;
    }
    if (pincode !== '852127' && pincode !== '852126') {
      setError('Sorry, we are currently available only at pincode 852127 and 852126');
      return;
    }
    if (isNaN(Number(distance)) || Number(distance) <= 0) {
      setError('Distance (in km) is required and must be a positive number');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const addressPayload = {
        title,
        fullAddress,
        landmark,
        city,
        pincode,
        isDefault,
        distance: Number(distance), // <-- send distance
      };
      if (isEditing) {
        await updateAddress(addressId!, addressPayload);
      } else {
        await addAddress(addressPayload);
      }
      navigate('/addresses');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <AppHeader 
        title={isEditing ? 'Edit Address' : 'Add New Address'} 
        showBackButton 
      />
      {/* Info box for service availability */}
      <div className="mx-4 mt-4 mb-2 rounded-lg bg-orange-500 text-white px-4 py-3 text-sm font-medium shadow">
        we are currently available at 852127 only!
      </div>
      <div className="flex-1 p-4 pb-16">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
              Address Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Home, Work, Parent's House"
              className="app-input"
            />
          </div>
          <div>
            <label htmlFor="fullAddress" className="block text-gray-700 font-medium mb-1">
              Full Address <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="fullAddress"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="House/Flat No, Building, Street"
              className="app-textarea min-h-[80px]"
            />
          </div>
          <div>
            <label htmlFor="landmark" className="block text-gray-700 font-medium mb-1">
              Landmark
            </label>
            <Input
              id="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="E.g., Near Bus Stand, Behind Temple"
              className="app-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="city" className="block text-gray-700 font-medium mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                className="app-input"
              />
            </div>
            <div>
              <label htmlFor="pincode" className="block text-gray-700 font-medium mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <Input
                id="pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit pincode"
                maxLength={6}
                className="app-input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="distance" className="block text-gray-700 font-medium mb-1">
              Distance (in km) <span className="text-red-500">*</span>
            </label>
            <Input
              id="distance"
              type="number"
              min="0"
              step="0.01"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              placeholder="Enter estimated distance in km from sharma chowk! "
              className="app-input"
              required
            />
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="isDefault" 
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            <label
              htmlFor="isDefault"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as default address
            </label>
          </div>
          {error && <p className="text-app-error text-sm">{error}</p>}
          <Button 
            type="submit"
            className="app-button app-button-primary w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Address' : 'Save Address'}
          </Button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default AddressForm;
