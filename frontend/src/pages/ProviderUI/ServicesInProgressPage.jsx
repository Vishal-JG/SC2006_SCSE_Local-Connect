import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ServicesInProgressPage.module.css";
import BackButton from "../../components/BackButton";

const ServicesInProgressPage = () => {
  const navigate = useNavigate();

  const onAcceptedClick = () => {
    navigate("/ProviderUI/AcceptedServicesPage");
  };

  const onPendingClick = () => {
    navigate("/ProviderUI/PendingServicesPage");
  };

  return (
    <div className={styles.servicesInProgressPage}>
      <div className={styles.pageHeader}>
        <BackButton />
        <h2>Services In Progress</h2>
        <p className={styles.subtitle}>Manage your active bookings</p>
      </div>

      {/* Cards */}
      <div className={styles.cardsWrapper}>
        <div className={styles.card} onClick={onAcceptedClick}>
          <div className={styles.cardIcon}>✓</div>
          <h3 className={styles.cardTitle}>ACCEPTED</h3>
          <p className={styles.cardSubtitle}>View confirmed services</p>
        </div>

        <div className={styles.card} onClick={onPendingClick}>
          <div className={styles.cardIcon}>⏳</div>
          <h3 className={styles.cardTitle}>PENDING</h3>
          <p className={styles.cardSubtitle}>Review booking requests</p>
        </div>
      </div>
    </div>
  );
};

export default ServicesInProgressPage;
