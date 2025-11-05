import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ViewServicePage.module.css";
import BackButton from "../../components/BackButton";
import { auth } from "../../firebase";
import { getIdToken } from "firebase/auth";

const fallbackImg = "https://via.placeholder.com/160x120.png?text=Service+Image";

const ViewServicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listing_id } = useParams();
  // Name aliased for clarity with backend fields
  const serviceFromState = location.state?.service;

  const [service, setService] = useState(serviceFromState || null);
  const [loading, setLoading] = useState(!serviceFromState);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only fetch from backend if no location.state or listing_id changed
    if (!serviceFromState && listing_id) {
      const fetchService = async () => {
        setLoading(true);
        setError("");
        try {
          const user = auth.currentUser;
          if (!user) throw new Error("You must be logged in!");
          const idToken = await getIdToken(user);

          const res = await axios.get(
            `http://localhost:5000/api/services/${listing_id}`,
            { headers: { Authorization: `Bearer ${idToken}` } }
          );

          if (res.data.success) {
            setService(res.data.service); // <-- correct
          } else {
            setError("Failed to load service details.");
          }
        } catch (err) {
          console.error(err);
          setError("Failed to load service details.");
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [listing_id, serviceFromState]);

  if (loading) return <div className={styles.page}>Loading service details...</div>;
  if (error) return <div className={styles.page}>{error}</div>;
  if (!service) return <div className={styles.page}>No service data found.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>View Service</h1>
        <p className={styles.subtitle}>Service details (view-only)</p>
      </div>

      <div className={styles.uploadContainer}>
        <img
          src={service.image_url || fallbackImg}
          alt={service.title || "Service"}
          className={styles.uploadedImage}
        />
        <span className={styles.uploadLabel}>Service Media</span>
      </div>

      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Service Name</label>
        <input type="text" value={service.title || ""} readOnly className={styles.input} />
      </div>

      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Category</label>
        <input
          type="text"
          value={service.category_id || "N/A"}
          readOnly
          className={styles.input}
        />
      </div>

      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Price</label>
        <input
          type="text"
          value={(service.price !== undefined && service.price !== null) ? `$${service.price}` : "N/A"}
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