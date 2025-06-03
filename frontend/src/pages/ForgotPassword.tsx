
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await forgotPassword(email, userRole);
      if (result) {
        setSuccess(true);
      } else {
        setError('Unable to process request. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="app-container">
      <AppHeader title="Forgot Password" showBackButton />
      
      <div className="flex-1 p-4 flex flex-col justify-center">
        {!success ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-app-primary">Reset Password</h1>
              <p className="text-gray-600">Enter your email to reset your password</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="user-role" className="block text-gray-700 font-medium">
                  Account type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    className={`${userRole === 'customer' ? 'bg-app-secondary border-app-primary' : ''}`}
                    onClick={() => setUserRole('customer')}
                  >
                    Customer
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    className={`${userRole === 'restaurant' ? 'bg-app-secondary border-app-primary' : ''}`}
                    onClick={() => setUserRole('restaurant')}
                  >
                    Restaurant Owner
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    className={`${userRole === 'delivery' ? 'bg-app-secondary border-app-primary' : ''}`}
                    onClick={() => setUserRole('delivery')}
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
              
              {error && <p className="text-app-error text-sm">{error}</p>}
              
              <div className="pt-2">
                <Button 
                  type="submit"
                  className="app-button app-button-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Reset Password'}
                </Button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-app-primary font-medium">
                  Login
                </Link>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <div className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Password Reset Email Sent!</h2>
            <p className="text-gray-600 mb-6">
              We've sent instructions to reset your password to {email}. 
              Please check your inbox and follow the instructions in the email.
            </p>
            <Button onClick={() => navigate('/login')} className="app-button app-button-primary">
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
