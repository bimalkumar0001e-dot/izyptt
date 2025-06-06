import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { showToast } from '@/utils/toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, sendOtp, verifyOtp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('restaurant');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [lastOtp, setLastOtp] = useState<string | null>(null);
  // Add these states for delivery/restaurant
  const [deliveryShowOtpScreen, setDeliveryShowOtpScreen] = useState(false);
  const [restaurantShowOtpScreen, setRestaurantShowOtpScreen] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (error) {
      setError('An error occurred. Please try again.');
      showToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSendOtp = async () => {
    if (phone !== '9534495027') {
      setError('Only the authorized admin phone number can login.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendOtp(phone, 'admin');
      if (res && res.otp) setLastOtp(res.otp);
      setShowOtpScreen(true);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid OTP');
      return;
    }
    setIsLoading(true);
    try {
      const data = await verifyOtp(phone, otp, name, 'admin'); // Pass role
      if (data.user && data.user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      setOtpError(error.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user selects customer role, show customer login (OTP) form
  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setError('');
    setEmail('');
    setPassword('');
    setPhone('');
    setName('');
    setShowOtpScreen(false);
    setOtp('');
    setOtpError('');
  };

  const handleCustomerSendOtp = async () => {
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendOtp(phone, 'customer');
      if (res && res.otp) setLastOtp(res.otp);
      setShowOtpScreen(true);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid OTP');
      return;
    }
    setIsLoading(true);
    try {
      const data = await verifyOtp(phone, otp, name, 'customer'); // Pass role for consistency
      if (data.user && data.user.role === 'customer') {
        navigate('/home');
      }
    } catch (error: any) {
      setOtpError(error.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delivery Partner OTP handlers
  const handleDeliverySendOtp = async () => {
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendOtp(phone, 'delivery');
      if (res && res.otp) setLastOtp(res.otp);
      setDeliveryShowOtpScreen(true);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid OTP');
      return;
    }
    setIsLoading(true);
    try {
      const data = await verifyOtp(phone, otp, name, 'delivery'); // Pass role
      if (data.user && data.user.role === 'delivery') {
        navigate('/delivery/dashboard');
      }
    } catch (error: any) {
      setOtpError(error.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryResendOtp = handleDeliverySendOtp;

  // Restaurant Partner OTP handlers
  const handleRestaurantSendOtp = async () => {
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendOtp(phone, 'restaurant');
      if (res && res.otp) setLastOtp(res.otp);
      setRestaurantShowOtpScreen(true);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid OTP');
      return;
    }
    setIsLoading(true);
    try {
      const data = await verifyOtp(phone, otp, name, 'restaurant'); // Pass role
      if (data.user && data.user.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      }
    } catch (error: any) {
      setOtpError(error.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantResendOtp = handleRestaurantSendOtp;

  // Render OTP screen for admin
  if (userRole === 'admin' && showOtpScreen) {
    return (
      <div className="app-container">
        <AppHeader title="Admin OTP Login" showBackButton />
        <div className="flex-1 p-4 pb-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-app-primary">Admin OTP Login</h1>
            <p className="text-gray-600 mt-2">
              Enter the 6-digit code sent to <span className="font-medium">{phone}</span>
            </p>
            {lastOtp && (
              <p className="text-gray-500 mt-2 text-sm">OTP: <span className="font-mono font-bold">{lastOtp}</span></p>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleAdminVerifyOtp(); }} className="space-y-6">
            <div className="flex justify-center">
              <Input
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
            {otpError && <p className="text-app-error text-sm text-center">{otpError}</p>}
            <div className="flex flex-col space-y-3">
              <Button type="submit" className="app-button app-button-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={() => setShowOtpScreen(false)} disabled={isLoading}>
                Back
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={handleAdminSendOtp} disabled={isLoading}>
                Resend OTP
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render OTP screen for customer
  if (userRole === 'customer' && showOtpScreen) {
    return (
      <div className="app-container">
        <AppHeader title="Customer OTP Login" showBackButton />
        <div className="flex-1 p-4 pb-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-app-primary">Customer OTP Login</h1>
            <p className="text-gray-600 mt-2">
              Check your Whatsapp-Enter the 6-digit code sent to <span className="font-medium">{phone}</span>
            </p>
            {lastOtp && (
              <p className="text-gray-500 mt-2 text-sm">OTP: <span className="font-mono font-bold">{lastOtp}</span></p>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleCustomerVerifyOtp(); }} className="space-y-6">
            <div className="flex justify-center">
              <Input
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
            {otpError && <p className="text-app-error text-sm text-center">{otpError}</p>}
            <div className="flex flex-col space-y-3">
              <Button type="submit" className="app-button app-button-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={() => setShowOtpScreen(false)} disabled={isLoading}>
                Back
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={handleCustomerSendOtp} disabled={isLoading}>
                Resend OTP
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // OTP screen for Delivery Partner
  if (userRole === 'delivery' && deliveryShowOtpScreen) {
    return (
      <div className="app-container">
        <AppHeader title="Delivery Partner OTP Login" showBackButton />
        <div className="flex-1 p-4 pb-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-app-primary">Delivery Partner OTP Login</h1>
            <p className="text-gray-600 mt-2">
              Enter the 6-digit code sent to <span className="font-medium">{phone}</span>
            </p>
            {lastOtp && (
              <p className="text-gray-500 mt-2 text-sm">OTP: <span className="font-mono font-bold">{lastOtp}</span></p>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleDeliveryVerifyOtp(); }} className="space-y-6">
            <div className="flex justify-center">
              <Input
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
            {otpError && <p className="text-app-error text-sm text-center">{otpError}</p>}
            <div className="flex flex-col space-y-3">
              <Button type="submit" className="app-button app-button-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={() => setDeliveryShowOtpScreen(false)} disabled={isLoading}>
                Back
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={handleDeliveryResendOtp} disabled={isLoading}>
                Resend OTP
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // OTP screen for Restaurant Partner
  if (userRole === 'restaurant' && restaurantShowOtpScreen) {
    return (
      <div className="app-container">
        <AppHeader title="Restaurant Partner OTP Login" showBackButton />
        <div className="flex-1 p-4 pb-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-app-primary">Restaurant Partner OTP Login</h1>
            <p className="text-gray-600 mt-2">
              Enter the 6-digit code sent to <span className="font-medium">{phone}</span>
            </p>
            {lastOtp && (
              <p className="text-gray-500 mt-2 text-sm">OTP: <span className="font-mono font-bold">{lastOtp}</span></p>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleRestaurantVerifyOtp(); }} className="space-y-6">
            <div className="flex justify-center">
              <Input
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
            {otpError && <p className="text-app-error text-sm text-center">{otpError}</p>}
            <div className="flex flex-col space-y-3">
              <Button type="submit" className="app-button app-button-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={() => setRestaurantShowOtpScreen(false)} disabled={isLoading}>
                Back
              </Button>
              <Button type="button" variant="outline" className="app-button" onClick={handleRestaurantResendOtp} disabled={isLoading}>
                Resend OTP
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <AppHeader title="Login" showBackButton />
      
      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <img src="/izypt-logo.png" alt="Izypt Logo" style={{ width: 90, height: 90, margin: '0 auto 16px auto' }} />
          <h1 className="text-2xl font-bold text-black">Bihar's Own Instant App</h1> 
          <p className="text-gray-600">Login to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="user-role" className="block text-gray-700 font-medium">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button"
                variant="outline"
                className={`${userRole === 'customer' ? 'bg-app-secondary border-app-primary' : ''}`}
                onClick={() => handleRoleChange('customer')}
              >
                Customer
              </Button>
              <Button 
                type="button"
                variant="outline"
                className={`${userRole === 'restaurant' ? 'bg-app-secondary border-app-primary' : ''}`}
                onClick={() => handleRoleChange('restaurant')}
              >
                Restaurant Owner
              </Button>
              <Button 
                type="button"
                variant="outline"
                className={`${userRole === 'delivery' ? 'bg-app-secondary border-app-primary' : ''}`}
                onClick={() => handleRoleChange('delivery')}
              >
                Delivery Partner
              </Button>
              <Button 
                type="button"
                variant="outline"
                className={`${userRole === 'admin' ? 'bg-app-secondary border-app-primary' : ''}`}
                onClick={() => setUserRole('admin')}
              >
                Admin
              </Button>
            </div>
          </div>
          
          {userRole === 'admin' ? (
            <>
              <div>
                <label htmlFor="admin-phone" className="block text-gray-700 font-medium mb-1">
                  Admin Phone Number
                </label>
                <Input
                  id="admin-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter admin phone number"
                  className="app-input"
                />
              </div>
              <div>
                <label htmlFor="admin-name" className="block text-gray-700 font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="admin-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="app-input"
                />
              </div>
              {error && <p className="text-app-error text-sm">{error}</p>}
              <div className="pt-2">
                <Button
                  type="button"
                  className="app-button app-button-primary"
                  disabled={isLoading}
                  onClick={handleAdminSendOtp}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </div>
            </>
          ) : userRole === 'customer' && !showOtpScreen ? (
            <>
              <div>
                <label htmlFor="customer-phone" className="block text-gray-700 font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  id="customer-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="app-input"
                />
              </div>
              <div>
                <label htmlFor="customer-name" className="block text-gray-700 font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="customer-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="app-input"
                />
              </div>
              {error && <p className="text-app-error text-sm">{error}</p>}
              <div className="pt-2">
                <Button
                  type="button"
                  className="app-button app-button-primary"
                  disabled={isLoading}
                  onClick={handleCustomerSendOtp}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </div>
            </>
          ) : userRole === 'delivery' && !deliveryShowOtpScreen ? (
            <>
              <div>
                <label htmlFor="delivery-phone" className="block text-gray-700 font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  id="delivery-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="app-input"
                />
              </div>
              <div>
                <label htmlFor="delivery-name" className="block text-gray-700 font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="delivery-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="app-input"
                />
              </div>
              {error && <p className="text-app-error text-sm">{error}</p>}
              <div className="pt-2">
                <Button
                  type="button"
                  className="app-button app-button-primary"
                  disabled={isLoading}
                  onClick={handleDeliverySendOtp}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </div>
            </>
          ) : userRole === 'restaurant' && !restaurantShowOtpScreen ? (
            <>
              <div>
                <label htmlFor="restaurant-phone" className="block text-gray-700 font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  id="restaurant-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="app-input"
                />
              </div>
              <div>
                <label htmlFor="restaurant-name" className="block text-gray-700 font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="restaurant-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="app-input"
                />
              </div>
              {error && <p className="text-app-error text-sm">{error}</p>}
              <div className="pt-2">
                <Button
                  type="button"
                  className="app-button app-button-primary"
                  disabled={isLoading}
                  onClick={handleRestaurantSendOtp}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="app-input"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="app-input"
                />
              </div>
              
              {error && <p className="text-app-error text-sm">{error}</p>}
              
              <div className="pt-2">
                <Button 
                  type="submit"
                  className="app-button app-button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </>
          )}
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Customers can login directly. Only others need to Register!{' '}
            <Link to="/register" className="text-app-primary font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
