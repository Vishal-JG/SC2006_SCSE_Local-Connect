import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PendingServicesPage.module.css";

// Import reusable components
import BackButton from "../../components/BackButton";

// Importing assets - SAMPLE IMAGES
import sample1 from "../../assets/sample1.png";
import sample2 from "../../assets/sample2.png";
import sample3 from "../../assets/sample3.png";

// Sample dummy data
const samplePendingServices = [
  { id: 1, name: "Elco Plumbing Co.", imageUrl: sample1 },
  { id: 2, name: "RapidFlow Plumbing Co.", imageUrl: sample2 },
  { id: 3, name: "QuickFix Solutions", imageUrl: sample3 },
];

const PendingServicesPage = () => {
  const navigate = useNavigate();

  const onViewClick = (service) => {
  navigate(`/ProviderUI/ViewServicePage/${service.id}`, { state: { service } });
  };

  const onAcceptClick = (service) => {
    const confirmed = window.confirm(`Are you sure you want to accept "${service.name}"?`);
    if (confirmed) {
      console.log("Service accepted:", service.id);
      // TODO: Update service status in backend or dummy data
    }
  };

  return (
  <div className={styles.pendingServicesPage}>
    <div className={styles.pageHeader}>
      <BackButton />
      <h2>Pending Services</h2>
    </div>

    {/* Service cards */}
    <div className={styles.servicesGrid}>
      {samplePendingServices.map((service) => (
        <div key={service.id} className={styles.serviceCard}>
          <img
            src={service.imageUrl}
            alt={service.name}
            className={styles.serviceImage}
          />
          <div className={styles.serviceInfo}>
            <p className={styles.serviceName}>{service.name}</p>

            {/* Buttons */}
            <div className={styles.buttonGroup}>
              <button
                className={styles.viewButton}
                onClick={() => onViewClick(service)}
              >
                View
              </button>

              <button
                className={styles.acceptButton}
                onClick={() => onAcceptClick(service)}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default PendingServicesPage;