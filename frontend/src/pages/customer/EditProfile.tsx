import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Optionally, fetchProfile can be called here if implemented in the future
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Always send email field to backend
    const payload: any = {
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar
    };

    updateProfile(payload)
      .then(() => {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
        setIsSubmitting(false);
        navigate('/profile');
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        setIsSubmitting(false);
        toast({
          title: "Update failed",
          description: "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="app-container">
      <AppHeader title="Edit Profile" showBackButton />
      
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3 relative">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-app-primary rounded-full flex items-center justify-center text-white">
              <ArrowLeft className="w-4 h-4 rotate-[225deg]" />
            </button>
          </div>
          <h2 className="font-semibold text-lg">{formData.name}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-app-primary hover:bg-app-accent"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
