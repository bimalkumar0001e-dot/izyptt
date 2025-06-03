
import React from 'react';
import { RecentService } from '@/types/product';

interface RecentServicesProps {
  services: RecentService[];
}

// This is an empty component as requested to remove the recent services functionality
const RecentServices: React.FC<RecentServicesProps> = () => {
  return null;
};

export default RecentServices;
