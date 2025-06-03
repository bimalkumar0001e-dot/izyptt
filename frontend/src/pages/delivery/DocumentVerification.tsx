
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const DocumentVerification: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated
  if (!isAuthenticated || user?.role !== 'delivery') {
    navigate('/login');
    return null;
  }
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState({
    idProof: null as File | null,
    drivingLicense: null as File | null,
    addressProof: null as File | null,
    vehicleRegistration: null as File | null,
    profilePhoto: null as File | null,
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof typeof documents) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({
        ...prev,
        [docType]: e.target.files![0]
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if all required documents are uploaded
    const missingDocuments = Object.entries(documents)
      .filter(([_, file]) => !file)
      .map(([key]) => key);
    
    if (missingDocuments.length > 0) {
      toast("Missing Documents", {
        description: `Please upload all required documents: ${missingDocuments.join(', ')}`,
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API upload
    setTimeout(() => {
      toast("Documents Uploaded", {
        description: "Your documents have been uploaded successfully and are pending verification.",
      });
      setIsSubmitting(false);
      navigate('/delivery/approval-status');
    }, 2000);
  };
  
  const renderDocumentUploadField = (
    label: string, 
    docType: keyof typeof documents, 
    description: string
  ) => (
    <div className="space-y-2 mb-4">
      <Label htmlFor={docType}>{label} <span className="text-red-500">*</span></Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        {documents[docType] ? (
          <div className="flex flex-col items-center">
            <FileCheck className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">{documents[docType]?.name}</p>
            <p className="text-xs text-gray-500">
              {Math.round((documents[docType]?.size || 0) / 1024)} KB
            </p>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => setDocuments(prev => ({ ...prev, [docType]: null }))}
            >
              Remove
            </Button>
          </div>
        ) : (
          <label htmlFor={docType} className="cursor-pointer flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium">Click to upload {label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
            <Input 
              id={docType} 
              type="file" 
              className="hidden" 
              accept="image/*, application/pdf"
              onChange={e => handleFileChange(e, docType)} 
            />
          </label>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="app-container">
      <AppHeader title="Document Verification" showBackButton />
      
      <div className="p-4">
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle>Document Verification</CardTitle>
            <CardDescription>
              We need to verify your identity and vehicle details before you can start delivering. 
              Please upload the following documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Important</p>
                  <p className="text-xs text-amber-700">
                    All documents should be clear, legible and not expired. Verification may take 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderDocumentUploadField(
            "ID Proof", 
            "idProof", 
            "Aadhar Card, PAN Card, Voter ID, etc."
          )}
          
          {renderDocumentUploadField(
            "Driving License", 
            "drivingLicense", 
            "Valid driving license"
          )}
          
          {renderDocumentUploadField(
            "Address Proof", 
            "addressProof", 
            "Utility bill, Rental agreement, etc."
          )}
          
          {renderDocumentUploadField(
            "Vehicle Registration", 
            "vehicleRegistration", 
            "RC Book of your vehicle"
          )}
          
          {renderDocumentUploadField(
            "Profile Photo", 
            "profilePhoto", 
            "Recent photo with clear face"
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-app-primary hover:bg-app-accent"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </div>
            ) : 'Submit Documents'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DocumentVerification;
