
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Timeline, 
  TimelineItem, 
  TimelineConnector, 
  TimelineHeader, 
  TimelineIcon, 
  TimelineBody 
} from '@/components/ui/timeline';

const ApprovalStatus: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated or not delivery partner
  if (!isAuthenticated || user?.role !== 'delivery') {
    navigate('/login');
    return null;
  }
  
  // Mock approval status - could come from user object
  const approvalStatus = 'pending'; // 'pending', 'approved', 'rejected'
  const verificationSteps = [
    { id: 1, name: 'Documents Uploaded', status: 'completed', date: '2025-05-15' },
    { id: 2, name: 'Document Verification', status: approvalStatus, date: '2025-05-16' },
    { id: 3, name: 'Background Check', status: 'pending', date: null },
    { id: 4, name: 'Account Activation', status: 'pending', date: null }
  ];
  
  const getStatusComponent = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="app-container">
      <AppHeader title="Approval Status" showBackButton />
      
      <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Application Status</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(approvalStatus)}`}>
              {approvalStatus.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Application ID: {user?.id?.substring(0, 8) || 'DEL12345'}
          </p>
          <p className="text-sm text-gray-600">
            Submitted on: May 15, 2025
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
          <h3 className="text-md font-medium mb-4">Verification Process</h3>
          
          <Timeline>
            {verificationSteps.map((step, index) => (
              <TimelineItem key={step.id} className={index === verificationSteps.length - 1 ? "" : ""}>
                {index < verificationSteps.length - 1 && <TimelineConnector />}
                <TimelineHeader>
                  <TimelineIcon className={getStatusColor(step.status)}>
                    {getStatusComponent(step.status)}
                  </TimelineIcon>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{step.name}</span>
                    {step.date && <span className="text-xs text-gray-500">{step.date}</span>}
                  </div>
                </TimelineHeader>
                <TimelineBody>
                  <div className="p-2">
                    {step.status === 'completed' && (
                      <p className="text-xs text-green-600">Successfully completed</p>
                    )}
                    {step.status === 'pending' && (
                      <p className="text-xs text-amber-600">In progress</p>
                    )}
                    {step.status === 'rejected' && (
                      <p className="text-xs text-red-600">Verification failed</p>
                    )}
                  </div>
                </TimelineBody>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
        
        {approvalStatus === 'pending' && (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Application Under Review</p>
                <p className="text-xs text-amber-700 mt-1">
                  We're currently reviewing your application and documents. 
                  This process typically takes 1-2 business days. You'll be notified once the review is complete.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {approvalStatus === 'rejected' && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
            <div className="flex items-start">
              <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Application Rejected</p>
                <p className="text-xs text-red-700 mt-1">
                  Unfortunately, your application has been rejected due to invalid or unclear documents. 
                  Please resubmit with clear and valid documents.
                </p>
                <Button 
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                  onClick={() => navigate('/delivery/document-verification')}
                >
                  Reapply
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {approvalStatus === 'approved' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Application Approved</p>
                <p className="text-xs text-green-700 mt-1">
                  Congratulations! Your application has been approved. 
                  You can now start accepting delivery orders.
                </p>
                <Button 
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  onClick={() => navigate('/delivery/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate('/delivery/document-verification')}
        >
          View Uploaded Documents
        </Button>
      </div>
    </div>
  );
};

export default ApprovalStatus;
