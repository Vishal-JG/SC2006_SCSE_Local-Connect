import React, { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";
import styles from "./AllExistingListingsPage.module.css";
import { getAuth } from "firebase/auth";

const AllExistingListingsPage = () => {
  const navigate = useNavigate();
  const [existingListings, setExistingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // Fetch all existing listings from backend (with auth token)
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;
        const res = await fetch("http://localhost:5000/api/admin/services/existing", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error("Failed to fetch listings");
        const data = await res.json();
        setExistingListings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const openModal = (listing) => {
    setSelectedListing(listing);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedListing) return;
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      const res = await fetch(`http://localhost:5000/api/admin/services/${selectedListing.listing_id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to delete listing");

      // Remove deleted listing from state
      setExistingListings(existingListings.filter(l => l.listing_id !== selectedListing.listing_id));
      setShowModal(false);
      alert("Listing deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting listing: " + err.message);
    }
  };

  if (loading) return <div className={styles.allExistingListings}>Loading...</div>;
  if (error) return <div className={styles.allExistingListings}>Error: {error}</div>;

  return (
    <div className={styles.allExistingListings}>
      <div className={styles.header}>
        <BackButton />
        <h2>All Existing Listings</h2>
      </div>

      <div className={styles.listingsGrid}>
        {existingListings.length === 0 && (
          <div className={styles.emptyState}>
            <p>No listings found.</p>
            <span className={styles.emptyHint}>Approved listings will appear here.</span>
          </div>
        )}
        {existingListings.map((listing) => {
          const created = listing.created_at ? new Date(listing.created_at) : null;
          const createdFmt = created ? created.toLocaleDateString() : "N/A";
          return (
            <div key={listing.listing_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.title}>{listing.title || "Untitled Listing"}</h3>
                <span className={styles.badgeApproved}>Approved</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Listed on:</span>
                <span className={styles.metaValue}>{createdFmt}</span>
              </div>
              {listing.description && (
                <p className={styles.description}>
                  {String(listing.description).length > 140
                    ? String(listing.description).slice(0, 140) + "..."
                    : String(listing.description)}
                </p>
              )}
              <div className={styles.actions}>
                <button className={styles.deleteBtn} onClick={() => openModal(listing)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p>
              Are you sure you want to <strong>delete</strong> this listing?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExistingListingsPage;
