import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import styles from "./AllReviewsPage.module.css";
import { getAuth } from "firebase/auth";

const AllReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;
        const res = await fetch("http://localhost:5000/api/admin/reviews", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        // Newest first: prefer created_at desc, fallback to id desc
        list.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          if (bTime !== aTime) return bTime - aTime;
          const aId = Number(a.id) || 0;
          const bId = Number(b.id) || 0;
          return bId - aId;
        });
        setReviews(list);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleReviewClick = (id) => {
    navigate(`/AdminUI/ReviewPage/${id}`, { replace: true });
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const openDeleteModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedReview) return;
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${selectedReview.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to delete review");
      setReviews((prev) => prev.filter((r) => r.id !== selectedReview.id));
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error deleting review: " + err.message);
    }
  };

  if (loading) return <div className={styles.allReviews}>Loading...</div>;
  if (error) return <div className={styles.allReviews}>Error: {error}</div>;

  return (
    <div className={styles.allReviews}>
      <div className={styles.header}>
        <BackButton />
        <h2>All Reviews</h2>
      </div>

      <div className={styles.reviewGrid}>
        {reviews.length === 0 && (
          <div className={styles.emptyState}>
            <p>No reviews found.</p>
            <span className={styles.emptyHint}>User reviews will appear here.</span>
          </div>
        )}
        {reviews.map((review) => (
          <div key={review.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.reviewer}>{review.reviewer || "Unknown"}</h3>
              <span className={styles.ratingBadge}>{review.rating}/5</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Service:</span>
              <span className={styles.metaValue}>{review.service || "N/A"}</span>
            </div>
            {review.comment && (
              <p className={styles.comment}>
                {String(review.comment).length > 140
                  ? String(review.comment).slice(0, 140) + "..."
                  : String(review.comment)}
              </p>
            )}
            <div className={styles.actions}>
              <button className={styles.viewBtn} onClick={() => handleReviewClick(review.id)}>View</button>
              <button className={styles.deleteBtn} onClick={() => openDeleteModal(review)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p>Are you sure you want to delete this review?</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={confirmDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllReviewsPage;
