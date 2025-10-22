import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ViewServicePage.module.css";
import BackButton from "../../components/BackButton";

const ViewServicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.state?.service;

  if (!service) {
    return <div className={styles.page}>No service data found.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>View Service</h1>
        <p className={styles.subtitle}>Service details (view-only)</p>
      </div>

      <div className={styles.uploadContainer}>
        <img
          src={service.imageUrl}
          alt={service.name}
          className={styles.uploadedImage}
        />
        <span className={styles.uploadLabel}>Service Media</span>
      </div>

      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Service Name</label>
        <input type="text" value={service.name} readOnly className={styles.input} />
      </div>

      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Category</label>
        <input
          type="text"
          value={service.category || "N/A"}
          readOnly
          className={styles.input}
        />
      </div>

      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Price</label>
        <input
          type="text"
          value={service.price ? `$${service.price}` : "N/A"}
          readOnly
          className={styles.input}
        />
      </div>

      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Description</label>
        <textarea
          value={service.description || "No description provided."}
          readOnly
          className={styles.textarea}
        />
      </div>
    </div>
  );
};

export default ViewServicePage;
