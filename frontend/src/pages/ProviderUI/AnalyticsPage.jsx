import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AnalyticsPage.module.css";
import BackButton from "../../components/BackButton";
import axios from "axios";
import { auth } from "../../firebase"; // assuming you are using Firebase Auth
import { getIdToken } from "firebase/auth";

const AnalyticsPage = () => {
  const [completedServices, setCompletedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedServices = async () => {
      try {
        setLoading(true);
        setError("");

        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in!");

        const idToken = await getIdToken(user);

        // Replace this URL with your actual backend endpoint
        const res = await axios.get(
          "http://localhost:5000/api/provider/analytics/completed_services",
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );

        // Adjust according to backend response
        setCompletedServices(res.data.completed_services || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch completed services.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedServices();
  }, []);

  const totalServicesCompleted = completedServices.length;
  const averageRating =
    completedServices.length > 0
      ? (
          completedServices.reduce((acc, s) => acc + (s.rating || 0), 0) /
          totalServicesCompleted
        ).toFixed(1)
      : 0;

  const onServiceClick = (service) => {
    navigate(`/ProviderUI/CompletedServicePage/${service.id}`, { state: { service } });
  };

  if (loading) return <div className={styles.analyticsPage}>Loading...</div>;
  if (error) return <div className={styles.analyticsPage}>{error}</div>;

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
              <p className={styles.review}>{service.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
