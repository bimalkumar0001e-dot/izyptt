import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllDishesPage from "./pages/AllDishesPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import RegistrationPending from "@/pages/RegistrationPending";
import PickupTrackPage from "./pages/track pickup page";
import MyPickups from "./pages/MyPickups";
import Favorites from "./pages/Favorites";
import TrackOrder from './pages/TrackOrder';
import FeedPeople from "./pages/FeedPeople";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import SearchPage from "./pages/SearchPage";
import ProductDetail from "./pages/ProductDetail";
import OrdersPage from "./pages/OrdersPage"; // Customer orders page
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/customer/EditProfile"; 
import ForgotPassword from "./pages/ForgotPassword";
import NotificationsPage from "./pages/NotificationsPage";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import PickupDrop from "./pages/pickup-drop";
import RestaurantListPage from "./pages/RestaurantListPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import PromoCode from "./pages/PromoCode";
import PickupConfirmationPage from '@/pages/pickupConfirmationPage';
import ReturnInstructionPage from "./pages/ReturnInstructionPage";
import ContactUsPage from "./pages/ContactUsPage";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import AddressManagement from "./pages/customer/AddressManagement";
import AddressForm from "./pages/customer/AddressForm";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminIndex from "./pages/admin/Index";
import AdminDashboard from "./pages/admin/Dashboard";
import CustomerManagement from "./pages/admin/CustomerManagement";
import RestaurantManagement from "./pages/admin/RestaurantManagement";
import DeliveryManagement from "./pages/admin/DeliveryManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import ProductsManagement from "./pages/admin/ProductsManagement";
import SectionManagement from "./pages/admin/SectionManagement"; // <-- Import SectionManagement
import UserApproval from "./pages/admin/UserApproval";
import ManageOffers from "./pages/admin/OfferManagement";
import FinancialManagement from "./pages/admin/FinancialManagement";
import PaymentMethodsAdmin from "./pages/admin/PaymentMethods";
import BannerManagement from "./pages/admin/BannerManagement";
import PickupManagement from "./pages/admin/PickupManagement";
import Reports from "./pages/admin/Reports";
import ProfileWallpaperManagment from "./pages/admin/ProfileWallpaperManagment";
import ChargesTaxesFeesManagement from "./pages/admin/ChargesTaxesFeesManagement";
import ReturnInstructionManagement from "./pages/admin/ReturnInstructionManagement";
import AdminNotification from '@/pages/admin/AdminNotification';
import CartManagement from "./pages/admin/CartManagement";
import ProductReviewManage from "./pages/admin/ProductReviewManage";
import DeliveryTimeManagement from "./pages/admin/DeliveryTimeManagement"; // <-- Import DeliveryTimeManagement

// Restaurant Pages
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import MenuPage from "./pages/restaurant/MenuPage";
import RestaurantOrdersPage from "./pages/restaurant/RestaurantOrdersPage"; // <-- Rename here
import RestaurantProfile from "./pages/restaurant/RestaurantProfile";
import RestaurantNotification from "./pages/restaurant/RestaurantNotification";

// Delivery Pages
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryOrdersPage from "./pages/delivery/AssignedOrdersPage";
import DeliveryOrderDetail from "./pages/delivery/OrderDetail";
import DeliveryProfile from "./pages/delivery/DeliveryProfile";
import DeliveryEarnings from "./pages/delivery/DeliveryEarnings";
import DeliveryDocumentVerification from "./pages/delivery/DocumentVerification";
import DeliveryApprovalStatus from "./pages/delivery/ApprovalStatus";
import AssignedPickups from "./pages/delivery/AssignedPickups";
import PickupDetail from "./pages/delivery/PickupDetail";
import DeliveryRegister from "./pages/delivery/DeliveryRegister";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Common Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/favorites" element={<Favorites />} />
                
                <Route path="/promos" element={<PromoCode />} />
                <Route path="/all-dishes" element={<AllDishesPage />} />
                <Route path="/registration-pending" element={<RegistrationPending />} />
                
                {/* Customer Routes */}
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order/:id" element={<OrderDetail />} />
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/addresses" element={<AddressManagement />} />
                <Route path="/addresses/add" element={<AddressForm />} />
                <Route path="/addresses/edit/:addressId" element={<AddressForm />} />
                <Route path="/pickup-drop" element={<PickupDrop />} />
                <Route path="/my-pickups" element={<MyPickups />} />
                <Route path="/restaurants" element={<RestaurantListPage />} />
                <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                <Route path="/pickup-confirmation/:id" element={<PickupConfirmationPage />} />
                <Route path="/pickup-track/:id" element={<PickupTrackPage />} />
                <Route path="/track-order/:orderId" element={<TrackOrder />} />
                <Route path="/return-instructions" element={<ReturnInstructionPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/feed-people" element={<FeedPeople />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminIndex />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="restaurants" element={<RestaurantManagement />} />
                  <Route path="delivery-partners" element={<DeliveryManagement />} />
                  <Route path="orders" element={<OrdersManagement />} />
                  <Route path="products" element={<ProductsManagement />} />
                  <Route path="product-reviews" element={<ProductReviewManage />} /> {/* <-- Add this line */}
                  <Route path="sections" element={<SectionManagement />} /> {/* <-- Add this line */}
                  <Route path="approval" element={<UserApproval />} />
                  <Route path="offers" element={<ManageOffers />} />
                  <Route path="finance" element={<FinancialManagement />} />
                  <Route path="payment-methods" element={<PaymentMethodsAdmin />} />
                  <Route path="banners" element={<BannerManagement />} />
                  <Route path="pickup" element={<PickupManagement />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile-wallpaper-management" element={<ProfileWallpaperManagment />} /> {/* <-- Add this line */}
                  <Route path="chargestaxesfees" element={<ChargesTaxesFeesManagement />} />
                  <Route path="return-instructions" element={<ReturnInstructionManagement />} /> {/* <-- Add this line */}
                  <Route path="cart-management" element={<CartManagement />} />
                  <Route path="delivery-time-management" element={<DeliveryTimeManagement />} /> {/* <-- Add this line */}
                  <Route path="/admin/notifications" element={<AdminNotification />} />
                </Route>
                
                {/* Restaurant Routes */}
                <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
                <Route path="/restaurant/menu" element={<MenuPage />} />
                <Route path="/restaurant/orders" element={<RestaurantOrdersPage />} /> {/* <-- Update here */}
                <Route path="/restaurant/profile" element={<RestaurantProfile />} />
                <Route path="/restaurant/notifications" element={<RestaurantNotification />} />



                {/* Delivery Routes */}
                <Route path="/delivery/register" element={<DeliveryRegister />} />
                <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                <Route path="/delivery/orders" element={<DeliveryOrdersPage />} />
                <Route path="/delivery/orders/:id" element={<DeliveryOrderDetail />} />
                <Route path="/delivery/profile" element={<DeliveryProfile />} />
                <Route path="/delivery/earnings" element={<DeliveryEarnings />} />
                <Route path="/delivery/notifications" element={<NotificationsPage />} />
                <Route path="/delivery/document-verification" element={<DeliveryDocumentVerification />} />
                <Route path="/delivery/approval-status" element={<DeliveryApprovalStatus />} />
                <Route path="/delivery/pickup" element={<AssignedPickups />} />
                <Route path="/delivery/pickup/:pickupId" element={<PickupDetail />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;