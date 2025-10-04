import React from "react";
import Authpage from "./Authpage";
import Navbar from "./components/navBar";
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./App.css"
import MainUI from "./pages/MainUI/MainUI";
import ServiceUI from "./pages/ConsumerUI/ServiceUI/ServiceUI";
import ServiceListPage from "./pages/ConsumerUI/ServiceUI/ServiceListPage";
import { AuthProvider } from "./AuthContext";

export default function App() {
  return (
    <div className="app">
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<MainUI />} />
          <Route path="/service" element={<ServiceUI />} />
          <Route path="/service/:type" element={<ServiceListPage />} />
          <Route path="/login" element={<Authpage />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}
