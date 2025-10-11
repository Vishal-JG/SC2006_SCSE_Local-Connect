import React from "react";
import Authpage from "./Authpage";
import Navbar from "./components/navBar";
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./App.css"
import MainUI from "./pages/MainUI/MainUI";
import ServiceUI from "./pages/ConsumerUI/ServiceUI/ServiceUI";
import ServiceListPage from "./pages/ConsumerUI/ServiceUI/ServiceListPage";
import BookmarkUI from "./pages/ConsumerUI/BookmarkUI/BookmarkUI"
import MapUI from "./pages/ConsumerUI/MapUI/MapUI"
import { AuthProvider } from "./AuthContext";
import ServiceDetailPage from "./pages/ConsumerUI/ServiceUI/ServiceDetailPage";

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
        </Routes>
      </AuthProvider>
    </div>
  );
}
