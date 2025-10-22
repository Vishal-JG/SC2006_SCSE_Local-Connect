import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ServicesInProgressPage.module.css";

// Reusable components
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
      </div>

      {/* Cards */}
      <div className={styles.cardsWrapper}>
        <div className={styles.card} onClick={onAcceptedClick}>
          <p className={styles.cardTitle}>ACCEPTED</p>
          <p className={styles.cardTitle}>SERVICES</p>
        </div>
        <div className={styles.card} onClick={onPendingClick}>
          <p className={styles.cardTitle}>PENDING</p>
          <p className={styles.cardTitle}>SERVICES</p>
        </div>
    </div>
  </div>
  );

};

export default ServicesInProgressPage;
