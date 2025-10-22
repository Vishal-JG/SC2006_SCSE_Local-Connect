import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import styles from "./CompletedServicePage.module.css";
import BackButton from "../../components/BackButton";

const dummyCompletedServices = [
  { id: 1, name: "Elco Plumbing Co.", customer: "John Doe", rating: 4.5, review: "Excellent work!" },
  { id: 2, name: "RapidFlow Plumbing Co.", customer: "Jane Smith", rating: 4.0, review: "Good service." },
  { id: 3, name: "QuickFix Solutions", customer: "Alice Lee", rating: 5.0, review: "Highly recommend!" },
];

const CompletedServicePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [service, setService] = useState(location.state?.service || null);

  useEffect(() => {
    // Uncomment to fetch service from backend
    /*
    if (!service) {
      fetch(`/api/services/completed/${id}`)
        .then((res) => res.json())
        .then((data) => setService(data))
        .catch((err) => console.error("Failed to fetch service:", err));
    }
    */

    // Use dummy data if state is not passed
    if (!service) {
      const found = dummyCompletedServices.find((s) => s.id === parseInt(id));
      setService(found);
    }
  }, [id, service]);

  if (!service) return <div className={styles.page}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>Completed Service</h1>
      </div>

      <div className={styles.detailCard}>
        <p className={styles.label}>Service Name</p>
        <p className={styles.value}>{service.name}</p>

        <p className={styles.label}>Customer Name</p>
        <p className={styles.value}>{service.customer}</p>

        <p className={styles.label}>Rating</p>
        <p className={styles.value}>{service.rating} ⭐</p>

        <p className={styles.label}>Review</p>
        <p className={styles.value}>{service.review}</p>
      </div>
    </div>
  );
};

export default CompletedServicePage;
