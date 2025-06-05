import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/components/ui/use-toast';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, sendOtp, verifyOtp } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('restaurant'); // Default to restaurant
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP related states
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [lastOtp, setLastOtp] = useState<string | null>(null);
  
  // For non-customer roles, we need additional fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [vehicle, setVehicle] = useState(''); // <-- Add this line

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSendOTP = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    try {
      // Only call register for customer role
      if (userRole === 'customer') {
        await register({
          name,
          phone,
          role: userRole,
          email: `${phone}@placeholder.com`,
          password: 'tempPass123'
        });
      }
      const res = await sendOtp(phone, userRole);
      if (res && res.otp) setLastOtp(res.otp);
      setShowOtpScreen(true);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid OTP');
      return;
    }
    setIsLoading(true);
    try {
      const data = await verifyOtp(phone, otp);
      // For restaurant/delivery, after OTP verification, show pending approval message
      if (userRole !== 'customer') {
        toast({
          title: "Phone Verified!",
          description: "Registration request sent for admin approval. You'll be notified once approved.",
        });
        navigate('/registration-pending');
      } else if (userRole === 'customer' && data.token) {
        toast({
          title: "Registration Successful!",
          description: "Welcome to Izypt! Please complete your profile in the Profile section.",
        });
        navigate('/home');
      } else {
        setShowOtpScreen(false);
        setOtpError('');
      }
    } catch (error: any) {
      setOtpError(error.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'customer') {
      if (!email || !password || !confirmPassword) {
        setError('Please fill all the fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!image) {
        setError('Please upload an image');
        return;
      }
      // Require vehicle for delivery partner
      if (userRole === 'delivery' && !vehicle.trim()) {
        setError('Vehicle name is required for delivery partners');
        return;
      }
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('role', userRole);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('image', image);
        if (userRole === 'delivery') {
          formData.append('vehicle', vehicle);
        }

        // Use full backend URL
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          body: formData
        });
        let data = {};
        try {
          data = await res.json();
        } catch (e) {
          throw new Error('Server error. Please try again.');
        }
        if (!res.ok) throw new Error((data as any).message || 'Registration failed');
        // --- Set OTP from backend response for non-customer roles ---
        if ((data as any).otp) setLastOtp((data as any).otp);
        setShowOtpScreen(true);
        setError('');
      } catch (error: any) {
        setError(error.message || 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Render OTP verification screen
  if (showOtpScreen) {
    return (
      <div className="app-container">
        <AppHeader title="Verify OTP" showBackButton />
        <div className="flex-1 p-4 pb-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-app-primary">Verify Your Number</h1>
            <p className="text-gray-600 mt-2">
              {userRole === 'customer'
                ? <>Enter the 6-digit code sent to <span className="font-medium">{phone}</span></>
                : <>Enter the 6-digit code shown below</>
              }
            </p>
            {/* Show OTP for non-customer roles */}
            {userRole !== 'customer' && lastOtp && (
              <p className="text-gray-500 mt-2 text-sm">OTP: <span className="text-lg font-mono font-bold">{lastOtp}</span></p>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {otpError && <p className="text-app-error text-sm text-center">{otpError}</p>}
            <div className="flex flex-col space-y-3">
              <Button type="submit" className="app-button app-button-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={() => setShowOtpScreen(false)} disabled={isLoading}>
                Back
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={handleSendOTP} disabled={isLoading}>
                Resend OTP
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // Render initial registration screen with role selection
  return (
    <div className="app-container">
      <AppHeader title="Become Our Partner" showBackButton />
      <div className="flex-1 p-4 pb-8">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-app-primary">Become Our Partner</h1>
          <p className="text-gray-600">Join Izypt</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="space-y-2">
            <label htmlFor="user-role" className="block text-gray-700 font-medium">
              Register as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className={`${userRole === 'restaurant' ? 'bg-app-secondary border-app-primary' : ''}`} onClick={() => setUserRole('restaurant')}>
                Restaurant Owner
              </Button>
              <Button type="button" variant="outline" className={`${userRole === 'delivery' ? 'bg-app-secondary border-app-primary' : ''}`} onClick={() => setUserRole('delivery')}>
                Delivery Partner
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="app-input" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
              Phone Number
            </label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" className="app-input" />
          </div>
          {/* Show vehicle name field only for delivery partner */}
          {userRole === 'delivery' && (
            <div>
              <label htmlFor="vehicle" className="block text-gray-700 font-medium mb-1">
                Vehicle Name
              </label>
              <Input
                id="vehicle"
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="Enter your vehicle name"
                className="app-input"
              />
            </div>
          )}
          <div>
            <label htmlFor="image" className="block text-gray-700 font-medium mb-1">
              Upload Image
            </label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="app-input"
            />
            {image && <span className="text-xs text-gray-500 mt-1">{image.name}</span>}
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="app-input" />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="app-input" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="app-input" />
          </div>
          <div className="pt-2">
            <Button type="submit" className="app-button app-button-primary" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </div>
          {error && <p className="text-app-error text-sm">{error}</p>}
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-app-primary font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;