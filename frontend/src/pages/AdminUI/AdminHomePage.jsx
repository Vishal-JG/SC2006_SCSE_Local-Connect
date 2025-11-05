import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminHomePage.module.css";
import { useAuth } from "../../AuthContext"; // adjust path if needed
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; // adjust path to your firebase.js

const AdminHomePage = () => {
  const navigate = useNavigate();
  const { user, userRole, logout } = useAuth();

  // ------------------------------
  // Redirect if not authenticated or not admin
  // ------------------------------
  useEffect(() => {
    if (!user || userRole !== "admin") {
      navigate("/login");
    }
  }, [user, userRole, navigate]);

  // ------------------------------
  // Navigation handlers
  // ------------------------------
  const onAllReviewsClick = useCallback(
    () => navigate("/AdminUI/AllReviewsPage"),
    [navigate]
  );
  const onExistingListingsClick = useCallback(
    () => navigate("/AdminUI/AllExistingListingsPage"),
    [navigate]
  );
  const onPendingListingsClick = useCallback(
    () => navigate("/AdminUI/AllPendingListingsPage"),
    [navigate]
  );

  // ------------------------------
  // Logout handler
  // ------------------------------
  const onLogoutClick = useCallback(async () => {
    try {
      await logout(); // clears context & localStorage
      await signOut(auth); // Firebase sign out
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, [logout, navigate]);

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.dashboardHeader}>
        <h2>Admin Dashboard</h2>
      </div>

      <div className={styles.dashboardButtons}>
        <div className={styles.card} onClick={onAllReviewsClick}>
          <p>All Reviews</p>
        </div>

        <div className={styles.card} onClick={onExistingListingsClick}>
          <p>All Existing Listings</p>
        </div>

        <div className={styles.card} onClick={onPendingListingsClick}>
          <p>All Pending Listings</p>
        </div>

        <div className={styles.card} onClick={onLogoutClick}>
          <p>Log Out</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
