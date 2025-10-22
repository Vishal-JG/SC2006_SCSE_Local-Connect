import React from "react";
import Authpage from "./pages/Authpage";
import Navbar from "./components/navBar";
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./App.css"
import MainUI from "./pages/MainUI/MainUI";

// Consumer UI pages
import ServiceUI from "./pages/ConsumerUI/ServiceUI/ServiceUI";
import ServiceListPage from "./pages/ConsumerUI/ServiceUI/ServiceListPage";
import BookmarkUI from "./pages/ConsumerUI/BookmarkUI/BookmarkUI"
import MapUI from "./pages/ConsumerUI/MapUI/MapUI"
import { AuthProvider } from "./AuthContext";
import ServiceDetailPage from "./pages/ConsumerUI/ServiceUI/ServiceDetailPage";
import ProfileUI from "./pages/ConsumerUI/ProfileUI/ProfileUI";
import AboutUI from "./pages/ConsumerUI/AboutUI/AboutUI";
import ContactUI from "./pages/ConsumerUI/ContactUI/ContactUI";

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

export default function App() {
  return (
    <div className="app">
      <AuthProvider>
        <div className="navbar-alignment">
          <Navbar />
        </div>
        <Routes>
          <Route path="/" element={<MainUI />} />
          <Route path="/service" element={<ServiceUI />} />
          <Route path="/service/:type" element={<ServiceListPage />} />
          <Route path="/login" element={<Authpage />} />
          <Route path="/bookmark" element={<BookmarkUI />} />
          <Route path="/service/:type/:id/map" element={<MapUI />} />
          <Route path="/service/:type/:id" element={<ServiceDetailPage />} />
          <Route path="/profile" element={<ProfileUI />} />
          <Route path="/about" element={<AboutUI />} />
          <Route path="/contact" element={<ContactUI />} />

          {/* Provider routes */}
          <Route path="/ProviderUI/ProviderDashboard" element={<ProviderDashboard />} />
          <Route path="/ProviderUI/MyListingsPage" element={<MyListingsPage />} />
          <Route path="/ProviderUI/AnalyticsPage" element={<AnalyticsPage />} />
          <Route path="/ProviderUI/ServicesInProgressPage" element={<ServicesInProgressPage />} />
          <Route path="/ProviderUI/AcceptedServicesPage" element={<AcceptedServicesPage />} />
          <Route path="/ProviderUI/PendingServicesPage" element={<PendingServicesPage />} />
          <Route path="/ProviderUI/ServiceUploadPage" element={<ServiceUploadPage />} />
          <Route path="/ProviderUI/EditServicePage/:id" element={<EditServicePage />} />
          <Route path="/ProviderUI/ViewServicePage/:id" element={<ViewServicePage />} />
          <Route path="/ProviderUI/CompletedServicePage/:id" element={<CompletedServicePage />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}
