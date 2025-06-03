
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { toast } from '@/components/ui/sonner';
import { Separator } from '@/components/ui/separator';

const DeliveryRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    vehicleType: '',
    city: '',
    address: '',
    agreeTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeTerms: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast("Passwords don't match", {
        description: "Please make sure both passwords are the same."
      });
      return;
    }
    
    if (!formData.agreeTerms) {
      toast("Terms & Conditions", {
        description: "You must agree to the Terms & Conditions to register."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'delivery' as UserRole
      });
      
      toast("Registration Successful", {
        description: "Your account is pending verification. Please complete document verification."
      });
      
      navigate('/delivery/document-verification');
    } catch (error) {
      console.error('Registration error:', error);
      toast("Registration Failed", {
        description: "An error occurred during registration. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="app-container">
      <AppHeader title="Delivery Partner Registration" showBackButton />
      
      <div className="p-4 pb-20">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-center">Join Our Delivery Team</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Register as a delivery partner and start earning
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select
              value={formData.vehicleType}
              onValueChange={(value) => handleSelectChange('vehicleType', value)}
            >
              <SelectTrigger id="vehicleType">
                <SelectValue placeholder="Select your vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="scooter">Scooter</SelectItem>
                <SelectItem value="car">Car</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => handleSelectChange('city', value)}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="kolkata">Kolkata</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="Enter your current address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="agreeTerms" 
              checked={formData.agreeTerms}
              onCheckedChange={handleCheckboxChange}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="agreeTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the Terms & Conditions
              </Label>
              <p className="text-xs text-gray-500">
                By registering, you agree to our Terms of Service, Privacy Policy, and Delivery Partner Agreement.
              </p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-4 bg-app-primary hover:bg-app-accent"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Registering...
              </div>
            ) : "Register as Delivery Partner"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </p>
        </div>
        
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-sm font-medium mb-2">Why Join Us?</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Flexible working hours</li>
            <li>• Competitive earnings</li>
            <li>• Weekly payments</li>
            <li>• Insurance coverage</li>
            <li>• Incentives & rewards</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegister;
