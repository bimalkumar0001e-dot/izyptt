import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddressList } from '@/components/AddressList';
import { MapPin, ArrowDown, UserPlus, Briefcase, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { Separator } from '@/components/ui/separator';
import { BACKEND_URL } from '@/utils/utils';

type TaskType = 'lunchbox' | 'documents' | 'clothes' | 'others';

interface TaskOption {
  id: TaskType;
  name: string;
  icon: React.ReactNode;
  description: string;
  colorClass: string;
}

const PickupDrop: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [pickupAddressId, setPickupAddressId] = useState<string>('');
  const [dropAddressId, setDropAddressId] = useState<string>('');
  const [taskType, setTaskType] = useState<TaskType | ''>('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Only redirect if we've finished loading AND user is null (not authenticated)
    // This prevents the redirect during the initial loading phase
    if (!isLoading && user === null) {
      navigate('/login'); // Redirect to login instead of register for better UX
    }
  }, [user, isLoading, navigate]);

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-app-primary"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  // If loading is complete but no user is found, we'll handle redirect in useEffect
  // This prevents showing content briefly before redirect

  // Only render the main content if we have a user
  if (!user) {
    return null;
  }
  
  const taskOptions: TaskOption[] = [
    {
      id: 'lunchbox',
      name: 'Send Lunchbox',
      icon: <Briefcase className="h-5 w-5" />,
      description: 'Deliver a homemade meal to your loved ones',
      colorClass: 'bg-green-100 text-green-700',
    },
    {
      id: 'documents',
      name: 'Send Documents',
      icon: <MapPin className="h-5 w-5" />,
      description: 'Courier important papers and documents',
      colorClass: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'clothes',
      name: 'Send Clothes',
      icon: <ShoppingBag className="h-5 w-5" />,
      description: 'Transport clothing items safely',
      colorClass: 'bg-pink-100 text-pink-700',
    },
    {
      id: 'others',
      name: 'Others',
      icon: <MapPin className="h-5 w-5" />,
      description: 'Any other small items that need to be delivered',
      colorClass: 'bg-gray-100 text-gray-700',
    },
  ];
  
  // Helper to get address object by id (handles id/_id)
  const getAddressById = (id: string) =>
    addresses.find((a: any) => a.id === id || a._id === id);

  // Helper to get display title for address
  const getAddressTitle = (address: any) =>
    address?.title || address?.label || address?.address || address?.fullAddress || 'Selected Address';

  // Helper to get full address string for backend
  const getFullAddressString = (address: any) =>
    (address?.fullAddress || address?.address || '') +
    (address?.city ? `, ${address.city}` : '') +
    (address?.pincode ? `, ${address.pincode}` : '');

  // Map frontend taskType to backend itemType
  const getItemType = (type: TaskType) => {
    switch (type) {
      case 'lunchbox': return 'Lunchbox';
      case 'documents': return 'Documents';
      case 'clothes': return 'Clothes';
      case 'others': return 'Others';
      default: return '';
    }
  };

  const API_BASE = `${BACKEND_URL}/api`;

  const handleSubmit = async () => {
    if (!pickupAddressId) {
      toast({
        title: "Pickup address required",
        description: "Please select a pickup address",
      });
      return;
    }

    if (!dropAddressId) {
      toast({
        title: "Drop address required",
        description: "Please select a drop address",
      });
      return;
    }

    if (!taskType) {
      toast({
        title: "Task type required", 
        description: "Please select what you want to send"
      });
      return;
    }

    // Prepare address details for backend
    const pickupAddressObj = getAddressById(pickupAddressId);
    const dropAddressObj = getAddressById(dropAddressId);

    if (!pickupAddressObj || !dropAddressObj) {
      toast({
        title: "Invalid address",
        description: "Please select valid addresses",
      });
      return;
    }

    // Ensure all required fields are present
    const pickupAddressStr = getFullAddressString(pickupAddressObj);
    const dropAddressStr = getFullAddressString(dropAddressObj);

    if (!pickupAddressStr || !dropAddressStr) {
      toast({
        title: "Invalid address details",
        description: "Address is missing required fields.",
      });
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Not logged in",
          description: "Please login again.",
        });
        navigate('/login');
        return;
      }
      // Call backend API to book pickup
      const res = await axios.post(
        `${API_BASE}/customer/pickup-drop/book`,
        {
          pickupAddress: pickupAddressStr,
          dropAddress: dropAddressStr,
          itemType: getItemType(taskType),
          note: description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      toast({
        title: "Pickup booked!",
        description: "We'll assign a delivery partner shortly",
      });
      // Navigate to pickup confirmation page with pickup id
      navigate(`/pickup-confirmation/${res.data.pickup._id}`);
    } catch (err: any) {
      toast({
        title: "Booking failed",
        description: err?.response?.data?.message || "Could not book pickup. Try again.",
      });
    }
  };

  const addresses = user?.address || [];
  
  return (
    <div className="app-container">
      <AppHeader title="Pick & Drop Service" showBackButton />
      
      <div className="flex-1 p-4 pb-28">
        {/* Stepper: Only 2 steps now */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                  step >= s ? 'bg-app-primary' : 'bg-gray-300'
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div 
                  className={`h-1 w-full flex-1 mx-2 ${
                    step > s ? 'bg-app-primary' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Pickup & Drop Address (stacked vertically) */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Select Pickup & Drop Address</h2>
            {/* Pickup Section */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-app-primary" />
                <h3 className="font-semibold text-base text-app-primary">Pickup Address</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => navigate('/addresses/add')}
                >
                  + Add New
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Where should we pick up your item?</p>
              <div>
                <AddressList
                  addresses={addresses}
                  selectedAddressId={pickupAddressId}
                  onAddressSelect={setPickupAddressId}
                  name="pickup-address-list"
                />
              </div>
              {addresses.length === 0 && (
                <Button
                  onClick={() => navigate('/addresses/add')}
                  className="w-full mt-4"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              )}
            </div>
            {/* Separator with arrow */}
            <div className="flex flex-col items-center justify-center my-2">
              <Separator className="w-2/3 bg-gray-200" />
              <ArrowDown className="my-2 text-app-primary" size={28} />
              <Separator className="w-2/3 bg-gray-200" />
            </div>
            {/* Drop Section */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-base text-blue-500">Drop Address</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => navigate('/addresses/add')}
                >
                  + Add New
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Where should we deliver your item?</p>
              <div>
                <AddressList
                  addresses={addresses}
                  selectedAddressId={dropAddressId}
                  onAddressSelect={setDropAddressId}
                  name="drop-address-list"
                />
              </div>
              {addresses.length === 0 && (
                <Button
                  onClick={() => navigate('/addresses/add')}
                  className="w-full mt-4"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              )}
            </div>
          </>
        )}

        {/* Step 2: Task Details */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4">What do you want to send?</h2>
            <RadioGroup value={taskType} onValueChange={(value) => setTaskType(value as TaskType)} className="space-y-3">
              {taskOptions.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-start p-4 rounded-xl border cursor-pointer transition-colors ${
                    taskType === option.id ? 'border-app-primary bg-app-secondary/10' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem 
                    value={option.id} 
                    id={option.id}
                    className="mr-3 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`mr-3 p-2 rounded-full ${option.colorClass}`}>
                        {option.icon}
                      </div>
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
            <div className="mt-6">
              <h3 className="font-medium mb-2">Additional Details</h3>
              <Textarea 
                placeholder="Add any special instructions or important details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </>
        )}

        {/* Summary/Confirmation */}
        {step === 2 && taskType && (
          <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="font-medium mb-3">Pickup Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pickup From:</span>
                <span className="text-sm font-medium">
                  {getAddressTitle(getAddressById(pickupAddressId))}
                </span>
              </div>
              <div className="flex justify-center my-2">
                <ArrowDown className="text-gray-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Drop To:</span>
                <span className="text-sm font-medium">
                  {getAddressTitle(getAddressById(dropAddressId))}
                </span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Task Type:</span>
                  <span className="text-sm font-medium">
                    {taskOptions.find(t => t.id === taskType)?.name || 'Selected Task'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex ${step > 1 ? 'justify-between' : 'justify-end'}`}>
          {step > 1 && (
            <Button 
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          {step === 1 ? (
            <Button 
              onClick={() => {
                if (!pickupAddressId) {
                  toast({
                    title: "Pickup address required",
                    description: "Please select a pickup address",
                  });
                  return;
                }
                if (!dropAddressId) {
                  toast({
                    title: "Drop address required",
                    description: "Please select a drop address",
                  });
                  return;
                }
                setStep(2);
              }}
              className="bg-app-primary hover:bg-app-primary/90"
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="bg-app-primary hover:bg-app-primary/90"
            >
              Book Pickup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickupDrop;
