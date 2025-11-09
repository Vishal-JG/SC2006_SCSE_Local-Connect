import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import styles from "./AdminHomePage.module.css";

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
  const onAllUsersClick = useCallback(
    () => navigate("/AdminUI/AllUsersPage"),
    [navigate]
  );

  const onLogoutClick = useCallback(() => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout failed", error);
        alert("Logout failed. Please try again.");
      });
  }, [navigate]);

  return (
    <div className={styles.adminDashboard}>
      {/* Back button + title to mirror provider style */}
      <div className={styles.dashboardHeader}>
        <h2 className={styles.headerTitle}>Admin Dashboard</h2>
      </div>

      {/* Action cards grid (text-only, no icons) */}
      <div className={styles.dashboardButtons}>
        <div className={styles.card} onClick={onAllReviewsClick}>
          <p>All Reviews</p>
        </div>

        <div className={styles.card} onClick={onExistingListingsClick}>
          <p>Existing Listings</p>
        </div>

        <div className={styles.card} onClick={onPendingListingsClick}>
          <p>Pending Listings</p>
        </div>

        <div className={styles.card} onClick={onAllUsersClick}>
          <p>All Users</p>
        </div>

        <div className={styles.card} onClick={onLogoutClick}>
          <p>Log Out</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
