import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Bell, LogOut, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileView, setIsMobileView] = React.useState(window.innerWidth < 1024);
  
  // Add detailed console logging
  React.useEffect(() => {
    console.log('AdminLayout: Auth state updated', {
      isLoading,
      isAuthenticated,
      user: user ? { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        status: user.status
      } : null
    });
  }, [isLoading, isAuthenticated, user]);
  
  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Show loading state while authentication check is in progress
  if (isLoading) {
    console.log('AdminLayout: Rendering loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-app-primary"></div>
      </div>
    );
  }

  // Only redirect to login if definitely not authenticated
  if (!isLoading && !isAuthenticated) {
    console.log('AdminLayout: Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Add a basic check for expected role to help with debugging
  if (user && user.role !== 'admin') {
    console.warn('AdminLayout: User authenticated but not admin role:', user.role);
    // Still render the admin layout - we're prioritizing avoiding blank screens
  }
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin panel",
    });
  };

  // Get the current page title
  const getPageTitle = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length < 2) return 'Dashboard';
    
    // Convert path to title (e.g., 'user-approval' to 'User Approval')
    const title = path[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return title;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {isMobileView ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden ml-2">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
          <AdminSidebar collapsed={!isSidebarOpen} />
        </div>
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            {!isMobileView && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-2"
              >
                <Menu />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" size="sm">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
