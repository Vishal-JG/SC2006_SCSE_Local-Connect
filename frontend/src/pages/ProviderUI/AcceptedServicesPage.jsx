import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";
import { getIdToken } from "firebase/auth";
import styles from "./AcceptedServicesPage.module.css";
import BackButton from "../../components/BackButton";

const fallbackImg = "https://via.placeholder.com/160x120.png?text=Service+Image";

const AcceptedServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in!");
        const idToken = await getIdToken(user);

        const res = await axios.get(
        "http://localhost:5000/api/bookings?role=provider&status=confirmed",
        { headers: { Authorization: `Bearer ${idToken}` } }
        );

        if (res.data.success) {
          setServices(res.data.bookings || []);
        } else {
          setError("Failed to fetch services.");
        }
      } catch (err) {
        console.error(err);
        setError("Couldn't fetch accepted services.");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // View service details
  const onViewClick = (service) => {
    navigate(`/ProviderUI/ViewServicePage/${service.listing_id}`, { state: { service } });
  };

  // Mark service as completed
  const onCompleteClick = async (service) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark "${service.title}" as completed?`
    );
    if (!confirmed) return;

    try {
      setSuccess("");
      setError("");
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in!");
      const idToken = await getIdToken(user);

      // Update booking status (use booking_id, not listing_id!)
      await axios.put(
        `http://localhost:5000/api/bookings/${service.booking_id}/status`,
        { status: "completed" },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      // Remove from list after completion
      setServices((old) => old.filter((s) => s.booking_id !== service.booking_id));
      setSuccess(`Marked "${service.title}" as completed!`);
    } catch (err) {
      console.error(err);
      setError("Failed to mark as completed.");
    }
  };

  if (loading) return <div className={styles.acceptedServicesPage}>Loading...</div>;
  if (error) return <div className={styles.acceptedServicesPage}>{error}</div>;

  return (
    <div className={styles.acceptedServicesPage}>
      <div className={styles.pageHeader}>
        <BackButton />
        <h2>Accepted Services</h2>
      </div>

      {success && <div style={{ color: "green", marginBottom: 10 }}>{success}</div>}

      {/* Service cards */}
      <div className={styles.listingsGrid}>
        {services.length === 0 && <div>No accepted/in-progress services right now.</div>}
        {services.map((service) => (
          <div key={service.booking_id} className={styles.listingCard}>
            <img
              src={service.image_url || fallbackImg}
              alt={service.title || "Service"}
              className={styles.listingImage}
            />
            <div className={styles.listingInfo}>
              <p className={styles.listingName}>{service.title || "Untitled Service"}</p>
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
