import React, { useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import styles from './ProviderDashboard.module.css';

// Importing reusable components
import BackButton from '../../components/BackButton';

// Import assets
import addServiceIcon from '../../assets/material-symbols_add-ad-outline.svg';
import analyticsIcon from '../../assets/qlementine-icons_file-manager-16.svg';
import gglistIcon from '../../assets/gg_list.svg';
import logoutIcon from '../../assets/ic_round-log-out.svg';

const ProviderDashboard = () => {
  const navigate = useNavigate();

  const onMyListingsClick = useCallback(() => navigate("/ProviderUI/MyListingsPage"), [navigate]);
  const onAnalyticsClick = useCallback(() => navigate("/ProviderUI/AnalyticsPage"), [navigate]);
  const onServicesClick = useCallback(() => navigate("/ProviderUI/ServicesInProgressPage"), [navigate]);
  const onLogoutClick = useCallback(async () => {
    try {
      await auth.signOut(); // End Firebase session
      localStorage.removeItem("token"); // Optional cleanup
      navigate("/login"); // Redirect to login
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  }, [navigate]);

  return (
    <div className={styles.providerDashboard}>
      {/* Back button + title */}
      <div className={styles.dashboardHeader}>
        <BackButton />
        <h2>Provider Dashboard</h2>
      </div>

      {/* Button grid */}
      <div className={styles.dashboardButtons}>
        <div className={styles.card} onClick={onServicesClick}>
          <img src={addServiceIcon} alt="Services" />
          <p>Services In Progress</p>
        </div>

        <div className={styles.card} onClick={onAnalyticsClick}>
          <img src={analyticsIcon} alt="Analytics" />
          <p>Analytics</p>
        </div>

        <div className={styles.card} onClick={onMyListingsClick}>
          <img src={gglistIcon} alt="My Listings" />
          <p>My Listings</p>
        </div>

        <div className={styles.card} onClick={onLogoutClick}>
          <img src={logoutIcon} alt="Logout" />
          <p>Log Out</p>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;