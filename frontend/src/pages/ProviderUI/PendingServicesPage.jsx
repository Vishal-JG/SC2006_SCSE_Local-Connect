import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";
import { getIdToken } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faCalendarAlt, 
  faClock,
  faCheckCircle,
  faEye,
  faHourglassHalf
} from "@fortawesome/free-solid-svg-icons";
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

  if (loading) return (
    <div className={styles.pendingServicesPage}>
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading pending bookings...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className={styles.pendingServicesPage}>
      <div className={styles.errorState}>{error}</div>
    </div>
  );

  return (
    <div className={styles.pendingServicesPage}>
      <div className={styles.pageHeader}>
        <BackButton to="/ProviderUI/ServicesInProgressPage" />
        <h2>
          <FontAwesomeIcon icon={faHourglassHalf} /> Pending Services
        </h2>
      </div>

      <div className={styles.servicesGrid}>
        {services.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No Pending Bookings</h3>
            <p>You don't have any pending booking requests right now.</p>
            <p className={styles.emptySubtext}>New booking requests will appear here when customers book your services.</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.booking_id} className={styles.serviceCard}>
              <div className={styles.cardHeader}>
                <img
                  src={service.image_url || fallbackImg}
                  alt={service.title || "Service"}
                  className={styles.serviceImage}
                />
                <div className={styles.statusBadge}>
                  <FontAwesomeIcon icon={faHourglassHalf} /> Pending
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.serviceName}>{service.title || "Untitled Service"}</h3>
                
                {/* Booking Details */}
                <div className={styles.bookingDetails}>
                  <div className={styles.detailRow}>
                    <FontAwesomeIcon icon={faCalendarAlt} className={styles.detailIcon} />
                    <span className={styles.detailLabel}>Date:</span>
                    <span className={styles.detailValue}>
                      {service.booking_date 
                        ? new Date(service.booking_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Not specified'}
                    </span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <FontAwesomeIcon icon={faClock} className={styles.detailIcon} />
                    <span className={styles.detailLabel}>Time:</span>
                    <span className={styles.detailValue}>
                      {service.booking_date 
                        ? new Date(service.booking_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className={styles.customerSection}>
                  <h4 className={styles.sectionTitle}>Customer Information</h4>
                  
                  <div className={styles.customerDetails}>
                    <div className={styles.detailRow}>
                      <FontAwesomeIcon icon={faUser} className={styles.detailIcon} />
                      <span className={styles.detailLabel}>Name:</span>
                      <span className={styles.detailValue}>
                        {service.customer_name || 'N/A'}
                      </span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <FontAwesomeIcon icon={faEnvelope} className={styles.detailIcon} />
                      <span className={styles.detailLabel}>Email:</span>
                      <span className={styles.detailValue}>
                        {service.customer_email || 'N/A'}
                      </span>
                    </div>
                    
                    {service.customer_phone && (
                      <div className={styles.detailRow}>
                        <FontAwesomeIcon icon={faPhone} className={styles.detailIcon} />
                        <span className={styles.detailLabel}>Phone:</span>
                        <span className={styles.detailValue}>
                          {service.customer_phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.viewButton}
                    onClick={() => onViewClick(service)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View Details
                  </button>
                  <button
                    className={styles.acceptButton}
                    onClick={() => onAcceptClick(service)}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Accept Booking
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingServicesPage;