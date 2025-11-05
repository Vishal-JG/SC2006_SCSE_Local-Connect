import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import styles from "./MyListingsPage.module.css";
import BackButton from "../../components/BackButton";
import addIcon from "../../assets/basil_add-outline.svg";

// Fallback image for listings without media
const fallbackImg = "https://via.placeholder.com/160x120.png?text=Service+Image";

const MyListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe;

    // Listen for auth state changes
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("You must be logged in!");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Get Firebase ID token for backend auth
        const idToken = await getIdToken(user);

        // Fetch listings for the logged-in provider
        const res = await axios.get("http://localhost:5000/api/provider/services", {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        setListings(res.data || []);
        console.log("Listings response:", res.data);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Couldn't fetch listings. Please try again later.");
      } finally {
        setLoading(false);
      }
    });

    // Cleanup on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Navigate to add new service
  const onAddNewServiceClick = () => navigate("/ProviderUI/ServiceUploadPage");

  // Navigate to edit/view service
  const onViewEditClick = (service) =>
    navigate(`/ProviderUI/EditServicePage/${service.listing_id}`, { state: { service } });

  if (loading) return <div className={styles.myListingsPage}>Loading...</div>;
  if (error) return <div className={styles.myListingsPage}>{error}</div>;

  return (
    <div className={styles.myListingsPage}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <BackButton />
        <h2>My Listings</h2>
      </div>

      {/* Listings grid */}
      <div className={styles.listingsGrid}>
        {listings.length === 0 && <div>No listings yet.</div>}

        {listings.map((listing) => {
          console.log(`Listing ${listing.listing_id} image_url:`, listing.image_url);
          return (
            <div key={listing.listing_id} className={styles.listingCard}>
              {/* Status Badge */}
              {listing.status === 'pending' && (
                <div className={styles.statusBadge}>
                  ⏳ Pending Admin Approval
                </div>
              )}
              {listing.status === 'approved' && (
                <div className={`${styles.statusBadge} ${styles.statusApproved}`}>
                  ✓ Approved
                </div>
              )}
              {listing.status === 'rejected' && (
                <div className={`${styles.statusBadge} ${styles.statusRejected}`}>
                  ✗ Rejected
                </div>
              )}
              
              <img
                src={listing.image_url || fallbackImg}
                alt={listing.title || "Service"}
                className={styles.listingImage}
                onError={(e) => {
                  console.error(`Failed to load image for listing ${listing.listing_id}:`, listing.image_url);
                  e.target.src = fallbackImg;
                }}
              />
              <div className={styles.listingInfo}>
                <p className={styles.listingName}>{listing.title || "Untitled Service"}</p>
                <button
                  className={styles.viewEditButton}
                  onClick={() => onViewEditClick(listing)}
                >
                  View / Edit
                </button>
              </div>
            </div>
          );
        })}

        {/* Add new service card */}
        <div className={styles.addNewServiceCard} onClick={onAddNewServiceClick}>
          <img src={addIcon} alt="Add New Service" />
          <p>Add New Service</p>
        </div>
      </div>
    </div>
  );
};

export default MyListingsPage;
