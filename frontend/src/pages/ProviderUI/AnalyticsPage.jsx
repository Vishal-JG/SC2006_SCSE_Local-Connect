import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AnalyticsPage.module.css";
import BackButton from "../../components/BackButton";

const dummyCompletedServices = [
  { id: 1, name: "Elco Plumbing Co.", customer: "John Doe", rating: 4.5, review: "Excellent work!" },
  { id: 2, name: "RapidFlow Plumbing Co.", customer: "Jane Smith", rating: 4.0, review: "Good service." },
  { id: 3, name: "QuickFix Solutions", customer: "Alice Lee", rating: 5.0, review: "Highly recommend!" },
];

const AnalyticsPage = () => {
  const [completedServices, setCompletedServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Uncomment this to fetch from backend later
    /*
    fetch("/api/services/completed")
      .then((res) => res.json())
      .then((data) => setCompletedServices(data))
      .catch((err) => console.error("Failed to fetch completed services:", err));
    */

    // Use dummy data for now
    setCompletedServices(dummyCompletedServices);
  }, []);

  const totalServicesCompleted = completedServices.length;
  const averageRating =
    completedServices.length > 0
      ? (completedServices.reduce((acc, s) => acc + s.rating, 0) / totalServicesCompleted).toFixed(1)
      : 0;

  const onServiceClick = (service) => {
    navigate(`/ProviderUI/CompletedServicePage/${service.id}`, { state: { service } });
  };

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.pageHeader}>
        <BackButton />
        <h2>Analytics Dashboard</h2>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Services Completed</p>
          <p className={styles.statValue}>{totalServicesCompleted}</p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Average Rating</p>
          <p className={styles.statValue}>{averageRating} ⭐</p>
        </div>
      </div>

      <div className={styles.completedServicesContainer}>
        <h3>Completed Services</h3>
        <div className={styles.completedServicesList}>
          {completedServices.map((service) => (
            <div
              key={service.id}
              className={styles.completedServiceCard}
              onClick={() => onServiceClick(service)}
            >
              <p className={styles.serviceName}>{service.name}</p>
              <p className={styles.customerName}>{service.customer}</p>
              <p className={styles.rating}>Rating: {service.rating} ⭐</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;