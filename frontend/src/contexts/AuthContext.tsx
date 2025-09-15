import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { User, UserRole, AuthState } from "@/types/user";
import { showToast } from "@/utils/toast";
import axios from "axios";
import { BACKEND_URL } from '@/utils/utils';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null; // Add token to the interface
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { name: string; email: string; password: string; role: UserRole; phone: string }) => Promise<void>;
  sendOtp: (phone: string) => Promise<{ message: string; otp?: string }>;
  verifyOtp: (phone: string, otp: string, name?: string, role?: UserRole) => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  forgotPassword: (email: string, role: UserRole) => Promise<boolean>;
  approveUser: (userId: string, role: 'restaurant' | 'delivery') => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: any) => Promise<boolean>;
  updateAddress: (addressId: string, address: any) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE = `${BACKEND_URL}/api`;

// Helper to decode JWT and check expiry
function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Try to load user/token from localStorage on initial load
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem("refreshToken");
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  // On mount, check for token and fetch profile if present
  useEffect(() => {
    const initializeAuth = async () => {
      let token = localStorage.getItem("token");
      let refreshToken = localStorage.getItem("refreshToken");
      // If token exists but is expired, try to refresh
      if (token && isTokenExpired(token) && refreshToken) {
        try {
          const res = await fetch(`${API_BASE}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshToken }),
          });
          const data = await res.json();
          if (res.ok && data.token) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
            token = data.token;
          } else {
            // Refresh failed, logout
            logout();
            return;
          }
        } catch {
          logout();
          return;
        }
      }
      // If token exists and is valid, restore session
      if (token && !isTokenExpired(token)) {
        setToken(token);
        setIsAuthenticated(true);
        await fetchProfile();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };
    initializeAuth();
  }, []);

  // Log out if user status is suspended or pending
  useEffect(() => {
    if (
      authState.user &&
      (authState.user.status === 'suspended' || authState.user.status === 'pending')
    ) {
      showToast('Your account is not active', 'error');
      logout();
    }
    // eslint-disable-next-line
  }, [authState.user?.status]);

  // Save user/token/refreshToken to localStorage on change
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
    }
  }, [user, token, refreshToken]);

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Show backend error message if available
        const msg = data?.message || "Login failed";
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        showToast(msg, "error");
        throw new Error(msg);
      }
      // Check for blocked/inactive status
      if (
        data.user.status === 'inactive' ||
        data.user.status === 'blocked'
      ) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        showToast('Your account is blocked', 'error');
        throw new Error('Your account is blocked');
      }
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      localStorage.setItem("token", data.token);
      setToken(data.token); // Update token state
      // Fetch latest profile from backend after login
      await fetchProfile();
      showToast("Login successful", "success");
      // Redirect based on role (after profile is hydrated)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'restaurant') navigate('/restaurant/dashboard');
      else if (user.role === 'delivery') navigate('/delivery/dashboard');
      else navigate('/home');
    } catch (error: any) {
      // Remove showToast here, already handled above
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    // Clear token state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    showToast("Logged out successfully", "success");
    navigate('/login');
  };

  // NOTE: This register function is only for customer/admin (JSON). 
  // For restaurant/delivery, use FormData POST directly in the registration page.
  const register = async (userData: { name: string; email: string; password: string; role: UserRole; phone: string }) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      showToast(data.message || "Registration successful", "success");
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      showToast(error.message, "error");
      throw error;
    }
  };

  const sendOtp = async (phone: string, role?: UserRole): Promise<{ message: string; otp?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      showToast("OTP sent!", "success");
      return data; // Return the full response so frontend can access OTP if present
    } catch (error: any) {
      showToast(error.message, "error");
      throw error;
    }
  };

  const verifyOtp = async (phone: string, otp: string, name?: string, role?: UserRole) => {
    try {
      const body: any = { phone, otp };
      if (name) body.name = name;
      if (role) body.role = role;
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (data.token && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
      showToast("OTP verified!", "success");
      return data;
    } catch (error: any) {
      showToast(error.message, "error");
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Implement as needed
    return true;
  };

  const forgotPassword = async (email: string, role: UserRole): Promise<boolean> => {
    // Implement as needed
    return true;
  };

  const approveUser = async (userId: string, role: 'restaurant' | 'delivery'): Promise<void> => {
    // Implement as needed
  };

  const rejectUser = async (userId: string): Promise<void> => {
    // Implement as needed
  };

  const updateUser = (data: Partial<User>) => {
    if (authState.user) {
      const updatedUser = {
        ...authState.user,
        ...data
      };
      setAuthState({
        ...authState,
        user: updatedUser
      });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const getProfileEndpoint = (role: string) => {
    if (role === 'customer') return `${API_BASE}/customer/profile`;
    if (role === 'restaurant') return `${API_BASE}/restaurants/profile`;
    if (role === 'delivery') return `${API_BASE}/delivery/profile`;
    if (role === 'admin') return `${API_BASE}/admin/profile`;
    return `${API_BASE}/customer/profile`;
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const endpoint = getProfileEndpoint(user.role);
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    await fetchProfile(); // Refresh user data after update
  };

  // Fetch user profile from backend using token from localStorage
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      return;
    }
    
    try {
      // Get role from stored user first, fallback to admin for admin panel
      let userRole = 'customer';
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          userRole = userData.role || 'customer';
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      
      // If we're on admin routes, assume admin role
      if (window.location.pathname.startsWith('/admin')) {
        userRole = 'admin';
      }
      
      const endpoint = getProfileEndpoint(userRole);
      console.log('Fetching profile from:', endpoint, 'with role:', userRole);
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        let userWithAddress = data;
        
        // If customer, fetch addresses and merge
        if (data.role === 'customer') {
          try {
            const addrRes = await fetch(`${API_BASE}/customer/addresses`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (addrRes.ok) {
              const addresses = await addrRes.json();
              userWithAddress = {
                ...data,
                address: addresses || [],
                addresses: addresses || []
              };
            }
          } catch (addrError) {
            console.error('Error fetching addresses:', addrError);
            userWithAddress = {
              ...data,
              address: [],
              addresses: []
            };
          }
        } else {
          userWithAddress = {
            ...data,
            address: data.address || data.addresses || []
          };
        }
        
        setAuthState({
          user: userWithAddress,
          isAuthenticated: true,
          isLoading: false,
        });
        setUser(userWithAddress);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userWithAddress));
      } else {
        console.error('Profile fetch failed with status:', res.status);
        // Don't immediately logout on network errors
        if (res.status === 401 || res.status === 403) {
          // Only logout on clear auth failures
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setToken(null);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't logout on network errors, keep existing state
    }
  };

  // Fetch addresses from backend
  const fetchAddresses = async () => {
    const res = await fetch(`${API_BASE}/customer/addresses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const addresses = await res.json();
    setAuthState((prev) => {
      const updatedUser = {
        ...prev.user,
        address: addresses.map((a: any) => ({ ...a, id: a._id }))
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return {
        ...prev,
        user: updatedUser
      };
    });
  };

  // Add new address
  const addAddress = async (address: any) => {
    const res = await fetch(`${API_BASE}/customer/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(address)
    });
    await fetchAddresses();
    return res.ok;
  };

  // Update address
  const updateAddress = async (addressId: string, address: any) => {
    const res = await fetch(`${API_BASE}/customer/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(address)
    });
    await fetchAddresses();
    return res.ok;
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    const res = await fetch(`${API_BASE}/customer/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await fetchAddresses();
    return res.ok;
  };

  // On login, fetch addresses
  useEffect(() => {
    if (authState.user && authState.user.role === 'customer') {
      fetchAddresses();
    }
  }, [authState.user?.id]);

  const value: AuthContextProps = {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    token, // Include token in the context value
    login,
    logout,
    register,
    sendOtp,
    verifyOtp,
    changePassword,
    forgotPassword,
    approveUser,
    rejectUser,
    updateProfile,
    updateUser,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress
  };

  // Remove this ENTIRE redirect block at the end of the component
  // This is causing all routes to redirect to dashboards!
  // ❌ DELETE THIS CODE:
  /*
  // Redirect logic based on authentication state
  if (authState.isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (authState.isAuthenticated && authState.user) {
    const userRole = authState.user.role;
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    } else if (userRole === 'delivery') {
      return <Navigate to="/delivery/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }
  */

  // Just return the children without redirection logic
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};