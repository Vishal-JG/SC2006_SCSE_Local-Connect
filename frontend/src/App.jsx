import React from "react";
import Authpage from "./pages/Authpage";
import Navbar from "./components/navBar";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import "./App.css"
import MainUI from "./pages/MainUI/MainUI";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider, useAuth } from "./AuthContext";

// Consumer UI pages
import ServiceUI from "./pages/ConsumerUI/ServiceUI/ServiceUI";
import ServiceListPage from "./pages/ConsumerUI/ServiceUI/ServiceListPage";
import BookmarkUI from "./pages/ConsumerUI/BookmarkUI/BookmarkUI"
import MapUI from "./pages/ConsumerUI/MapUI/MapUI"
import ServiceDetailPage from "./pages/ConsumerUI/ServiceUI/ServiceDetailPage";
import ProfileUI from "./pages/ConsumerUI/ProfileUI/ProfileUI";
import AboutUI from "./pages/ConsumerUI/AboutUI/AboutUI";
import ContactUI from "./pages/ConsumerUI/ContactUI/ContactUI";
import BookingUI from "./pages/ConsumerUI/BookingUI/BookingPage";

// Provider UI pages
import ProviderDashboard from "./pages/ProviderUI/ProviderDashboard";
import MyListingsPage from "./pages/ProviderUI/MyListingsPage";
import AnalyticsPage from "./pages/ProviderUI/AnalyticsPage";
import ServicesInProgressPage from "./pages/ProviderUI/ServicesInProgressPage";
import AcceptedServicesPage from "./pages/ProviderUI/AcceptedServicesPage";
import PendingServicesPage from "./pages/ProviderUI/PendingServicesPage";
import ServiceUploadPage from "./pages/ProviderUI/ServiceUploadPage";
import EditServicePage from "./pages/ProviderUI/EditServicePage";
import ViewServicePage from "./pages/ProviderUI/ViewServicePage";
import CompletedServicePage from "./pages/ProviderUI/CompletedServicePage";

// Admin UI pages
import AdminHomePage from "./pages/AdminUI/AdminHomePage";
import AllReviewsPage from "./pages/AdminUI/AllReviewsPage";
import AllExistingListingsPage from "./pages/AdminUI/AllExistingListingsPage";
import AllPendingListingsPage from "./pages/AdminUI/AllPendingListingsPage";
import ReviewPage from "./pages/AdminUI/ReviewPage";

// Component to conditionally render NavBar
function ConditionalNavBar() {
  const { userRole } = useAuth();
  const location = useLocation();
  const path = location.pathname || '';
  // Only show NavBar for consumers or when no role is set (public pages),
  // and never show on provider/admin sections to avoid flicker before role loads
  const inRestrictedSection = path.startsWith('/AdminUI') || path.startsWith('/ProviderUI');
  const shouldShowNavBar = (!userRole || userRole === 'customer') && !inRestrictedSection;
  
  return shouldShowNavBar ? (
    <div className="navbar-alignment">
      <Navbar />
    </div>
  ) : null;
}

export default function App() {
  return (
    <div className="app">
      <AuthProvider>
        <ConditionalNavBar />
        <Routes>
          <Route path="/" element={<MainUI />} />
          <Route path="/login" element={<Authpage />} />

          {/* Public routes - Services (no login required) */}
          <Route path="/service" element={<ServiceUI />} />
          <Route path="/service/:type" element={<ServiceListPage />} />
          <Route path="/service/:type/:id" element={<ServiceDetailPage />} />
          <Route path="/service/:type/:id/map" element={<MapUI />} />

          {/* Protected Consumer routes (login required) */}
          <Route path="/bookmark" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookmarkUI />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <ProfileUI />
            </ProtectedRoute>
          } />
          <Route path="/booking" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingUI />
            </ProtectedRoute>
          } />

          {/* Provider routes */}
          <Route path="/ProviderUI/ProviderDashboard" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/MyListingsPage" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <MyListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/AnalyticsPage" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/ServicesInProgressPage" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ServicesInProgressPage />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/AcceptedServicesPage" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <AcceptedServicesPage />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/PendingServicesPage" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <PendingServicesPage />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/ServiceUploadPage" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ServiceUploadPage />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/EditServicePage/:id" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <EditServicePage />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/ViewServicePage/:id" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ViewServicePage />
            </ProtectedRoute>
          } />
          <Route path="/ProviderUI/CompletedServicePage/:id" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <CompletedServicePage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/AdminUI/AdminHomePage" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHomePage />
            </ProtectedRoute>
          } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminHomePage />
              </ProtectedRoute>
            } />
          <Route path="/AdminUI/AllReviewsPage" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AllReviewsPage />
            </ProtectedRoute>
          } />
          <Route path="/AdminUI/AllExistingListingsPage" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AllExistingListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/AdminUI/AllPendingListingsPage" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AllPendingListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/AdminUI/ReviewPage/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReviewPage />
            </ProtectedRoute>
          } />

          {/* Public pages */}
          <Route path="/about" element={<AboutUI />} />
          <Route path="/contact" element={<ContactUI />} />

        </Routes>
      </AuthProvider>
    </div>
  );
}
