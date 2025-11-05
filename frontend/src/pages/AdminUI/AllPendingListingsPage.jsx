import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import styles from "./AllPendingListingsPage.module.css";
import { getAuth } from "firebase/auth";

const AllPendingListingsPage = () => {
  const navigate = useNavigate();
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);

  // Fetch pending listings (with auth token)
  useEffect(() => {
    const fetchPendingListings = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;
        const res = await fetch("http://localhost:5000/api/admin/services/pending", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error("Failed to fetch pending listings");

        const data = await res.json();
        setPendingListings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingListings();
  }, []);

  const openModal = (type, listing) => {
    setActionType(type);
    setSelectedListing(listing);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedListing) return;

    try {
      let url = "";
      const method = "POST";

      if (actionType === "Accept") {
        url = `http://localhost:5000/api/admin/services/${selectedListing.listing_id}/approve`;
      } else if (actionType === "Reject") {
        url = `http://localhost:5000/api/admin/services/${selectedListing.listing_id}/reject`;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      const res = await fetch(url, { method, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error("Action failed");

      // Remove listing from state
      setPendingListings((prev) =>
        prev.filter((l) => l.listing_id !== selectedListing.listing_id)
      );
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error performing action: " + err.message);
    }
  };

  if (loading) return <div className={styles.allPendingListings}>Loading...</div>;
  if (error) return <div className={styles.allPendingListings}>Error: {error}</div>;

  return (
    <div className={styles.allPendingListings}>
      <div className={styles.header}>
        <BackButton />
        <h2>All Pending Listings</h2>
      </div>

      <div className={styles.listingsGrid}>
        {pendingListings.length === 0 && (
          <div className={styles.emptyState}>
            <p>No pending listings.</p>
            <span className={styles.emptyHint}>New submissions awaiting review will appear here.</span>
          </div>
        )}
        {pendingListings.map((listing) => {
          const created = listing.created_at ? new Date(listing.created_at) : null;
          const createdFmt = created ? created.toLocaleDateString() : "N/A";
          return (
            <div key={listing.listing_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.title}>{listing.title || "Untitled Listing"}</h3>
                <span className={styles.badgePending}>Pending</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Provider:</span>
                <span className={styles.metaValue}>{listing.provider_name || "N/A"}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Submitted on:</span>
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
                <button className={styles.acceptBtn} onClick={() => openModal("Accept", listing)}>
                  Accept
                </button>
                <button className={styles.rejectBtn} onClick={() => openModal("Reject", listing)}>
                  Reject
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
              Are you sure you want to{" "}
              <strong>{actionType.toLowerCase()}</strong> this listing?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPendingListingsPage;
