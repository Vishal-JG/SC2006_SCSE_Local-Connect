import React, { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faTrashAlt, 
  faTimes,
  faInfoCircle,
  faTag,
  faDollarSign,
  faCalendarAlt,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AllExistingListingsPage.module.css";
import { getAuth } from "firebase/auth";

const AllExistingListingsPage = () => {
  const navigate = useNavigate();
  const [existingListings, setExistingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [listingDetails, setListingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const openDeleteModal = (listing) => {
    setSelectedListing(listing);
    setShowDeleteModal(true);
  };

  const openDetailsModal = async (listing) => {
    setSelectedListing(listing);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/services/${listing.listing_id}`);
      if (!res.ok) throw new Error("Failed to fetch listing details");
      const data = await res.json();
      setListingDetails(data);
    } catch (err) {
      console.error(err);
      setListingDetails({ error: err.message });
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setListingDetails(null);
    setSelectedListing(null);
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
      setShowDeleteModal(false);
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
        <BackButton to="/AdminUI/AdminHomePage" />
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
                <button className={styles.viewBtn} onClick={() => openDetailsModal(listing)}>
                  <FontAwesomeIcon icon={faEye} />
                  View Details
                </button>
                <button className={styles.deleteBtn} onClick={() => openDeleteModal(listing)}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <p>
              Are you sure you want to <strong>delete</strong> this listing?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className={styles.detailsModalOverlay} onClick={closeDetailsModal}>
          <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeDetailsModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {loadingDetails ? (
              <div className={styles.loadingDetails}>
                <div className={styles.spinner}></div>
                <p>Loading details...</p>
              </div>
            ) : listingDetails?.error ? (
              <div className={styles.errorDetails}>
                <p>Error: {listingDetails.error}</p>
              </div>
            ) : listingDetails ? (
              <>
                <h2 className={styles.detailsTitle}>
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Listing Details
                </h2>
                
                <div className={styles.detailsContent}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      <FontAwesomeIcon icon={faTag} /> Title:
                    </span>
                    <span className={styles.detailValue}>{listingDetails.title || "N/A"}</span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      <FontAwesomeIcon icon={faDollarSign} /> Price:
                    </span>
                    <span className={styles.detailValue}>
                      ${listingDetails.price ? parseFloat(listingDetails.price).toFixed(2) : "N/A"}
                    </span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      <FontAwesomeIcon icon={faCheckCircle} /> Status:
                    </span>
                    <span className={`${styles.detailValue} ${styles.statusBadge}`}>
                      {listingDetails.status || "N/A"}
                    </span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      <FontAwesomeIcon icon={faCalendarAlt} /> Created:
                    </span>
                    <span className={styles.detailValue}>
                      {listingDetails.created_at 
                        ? new Date(listingDetails.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "N/A"}
                    </span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Listing ID:</span>
                    <span className={styles.detailValue}>{listingDetails.listing_id}</span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Provider ID:</span>
                    <span className={styles.detailValue}>{listingDetails.provider_id || "N/A"}</span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Category ID:</span>
                    <span className={styles.detailValue}>{listingDetails.category_id || "N/A"}</span>
                  </div>
                  
                  {listingDetails.image_url && (
                    <div className={styles.detailImageRow}>
                      <span className={styles.detailLabel}>Image:</span>
                      <img 
                        src={listingDetails.image_url} 
                        alt={listingDetails.title} 
                        className={styles.detailImage}
                      />
                    </div>
                  )}
                  
                  {listingDetails.description && (
                    <div className={styles.detailDescRow}>
                      <span className={styles.detailLabel}>Description:</span>
                      <p className={styles.detailDescription}>{listingDetails.description}</p>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExistingListingsPage;
