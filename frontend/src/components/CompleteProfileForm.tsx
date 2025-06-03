
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CompleteProfileFormProps {
  onCancel?: () => void;
}

const CompleteProfileForm: React.FC<CompleteProfileFormProps> = ({ onCancel }) => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill all the fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      await updateProfile({
        ...user,
        email,
        // In a real app, password would be handled differently
      });
      
      toast({
        title: "Profile Updated!",
        description: "Your profile has been completed successfully.",
      });
      
      if (onCancel) {
        onCancel();
      } else {
        navigate('/profile');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-app-primary">Complete Your Profile</h2>
      
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
          Set Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          className="app-input"
        />
      </div>
      
      <div>
        <label htmlFor="confirm-password" className="block text-gray-700 font-medium mb-1">
          Confirm Password
        </label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="app-input"
        />
      </div>
      
      {error && <p className="text-app-error text-sm">{error}</p>}
      
      <div className="flex gap-2 pt-2">
        <Button 
          type="submit"
          className="app-button app-button-primary flex-1"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
        
        {onCancel && (
          <Button 
            type="button"
            variant="outline"
            className="app-button flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default CompleteProfileForm;
