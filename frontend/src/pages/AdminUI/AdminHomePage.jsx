import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminHomePage.module.css";

// import { getAuth, signOut } from "firebase/auth"; // Uncomment later when Firebase login works

const AdminHomePage = () => {
  const navigate = useNavigate();

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

  const onLogoutClick = useCallback(() => {
    // 🚧 TEMP LOGOUT PLACEHOLDER
    // Later, when Firebase auth is connected:
    // const auth = getAuth();
    // signOut(auth)
    //   .then(() => navigate("/login"))
    //   .catch((error) => console.error("Logout failed", error));

    alert("You have been logged out (placeholder)");
    navigate("/login"); // or your landing page
  }, [navigate]);

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
