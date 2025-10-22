import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AcceptedServicesPage.module.css";
import BackButton from "../../components/BackButton";

// Importing assets - SAMPLE IMAGES
import sample1 from "../../assets/sample1.png";
import sample2 from "../../assets/sample2.png";
import sample3 from "../../assets/sample3.png";

// Dummy data
const sampleAcceptedServices = [
  { id: 1, name: "Elco Plumbing Co.", imageUrl: sample1 },
  { id: 2, name: "RapidFlow Plumbing Co.", imageUrl: sample2 },
  { id: 3, name: "QuickFix Solutions", imageUrl: sample3 },
];

const AcceptedServicesPage = () => {
    const navigate = useNavigate();
    const onViewClick = (service) => {
      navigate(`/ProviderUI/ViewServicePage/${service.id}`, { state: { service } });
    };

    const onCompleteClick = (service) => {
      const confirmed = window.confirm(
        `Are you sure you want to mark "${service.name}" as completed?`
      );
      if (confirmed) {
        console.log("Service marked as completed:", service.id);
        // Later: update backend status via PATCH/PUT
      }
    };

    return (
    <div className={styles.acceptedServicesPage}>

      <div className={styles.pageHeader}>
        <BackButton />
        <h2>Accepted Services</h2>
      </div>

      {/* Service cards */}
      <div className={styles.listingsGrid}>
        {sampleAcceptedServices.map((service) => (
          <div key={service.id} className={styles.listingCard}>
            <img
              src={service.imageUrl}
              alt={service.name}
              className={styles.listingImage}
            />
            <div className={styles.listingInfo}>
              <p className={styles.listingName}>{service.name}</p>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.viewButton}
                  onClick={() => onViewClick(service)}
                >
                  View
                </button>
                <button
                  className={styles.completeButton}
                  onClick={() => onCompleteClick(service)}
                >
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
};

export default AcceptedServicesPage;