import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";
import { getIdToken } from "firebase/auth";
import styles from "./PendingServicesPage.module.css";
import BackButton from "../../components/BackButton";

const fallbackImg = "https://via.placeholder.com/160x120.png?text=Service+Image";

const PendingServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchPendingBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in!");
        const idToken = await getIdToken(user);

        // ✅ Fetch pending bookings for provider
        const res = await axios.get(
          "http://localhost:5000/api/bookings?role=provider&status=pending",
          { headers: { Authorization: `Bearer ${idToken}` } }
        );

        if (res.data.success) {
          setServices(res.data.bookings || []);
        } else {
          setError("Failed to fetch pending services.");
        }
      } catch (err) {
        console.error(err);
        setError("Couldn't fetch pending services.");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingBookings();
  }, []);

  // ✅ Navigate to service details page
  const onViewClick = (service) => {
    navigate(`/ProviderUI/ViewServicePage/${service.listing_id}`, { state: { service } });
  };

  // ✅ Accept a pending booking
  const onAcceptClick = async (service) => {
    const confirmed = window.confirm(`Accept booking for "${service.title}"?`);
    if (!confirmed) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in!");
      const idToken = await getIdToken(user);

      // ✅ Update booking status via backend route
      await axios.put(
        `http://localhost:5000/api/bookings/${service.booking_id}/status`,
        { status: "confirmed" }, // change pending → confirmed
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      // ✅ Remove from state (disappear from list)
      setServices((old) => old.filter((s) => s.booking_id !== service.booking_id));
      
      // Show success alert
      alert(`Accepted "${service.title}" successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to accept service. Please try again.");
    }
  };

  if (loading) return <div className={styles.pendingServicesPage}>Loading...</div>;
  if (error) return <div className={styles.pendingServicesPage}>{error}</div>;

  return (
    <div className={styles.pendingServicesPage}>
      <div className={styles.pageHeader}>
        <BackButton />
        <h2>Pending Services</h2>
      </div>

      <div className={styles.servicesGrid}>
        {services.length === 0 && <div>No pending bookings to accept.</div>}
        {services.map((service) => (
          <div key={service.booking_id} className={styles.serviceCard}>
            <img
              src={service.image_url || fallbackImg}
              alt={service.title || "Service"}
              className={styles.serviceImage}
            />
            <div className={styles.serviceInfo}>
              <p className={styles.serviceName}>{service.title || "Untitled Service"}</p>
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