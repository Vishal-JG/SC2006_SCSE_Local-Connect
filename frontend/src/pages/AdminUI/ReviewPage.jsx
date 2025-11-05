import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import styles from "./ReviewPage.module.css";

const ReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/reviews`);
        if (!res.ok) throw new Error("Failed to fetch reviews");

        const data = await res.json();
        const found = data.find((r) => r.id === Number(id));
        if (!found) throw new Error("Review not found");
        setReview(found);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const handleDelete = async () => {
    setShowModal(true);
  };

  const handleConfirm = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${review.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete review");

      alert("Review deleted successfully");
      navigate("/AdminUI/AllReviewsPage", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Error deleting review: " + err.message);
    }
  };

  const handleCancel = () => setShowModal(false);

  if (loading) return <div className={styles.reviewScreen}>Loading...</div>;
  if (error) return <div className={styles.reviewScreen}>Error: {error}</div>;

  return (
    <div className={styles.reviewScreen}>
      <div className={styles.header}>
        <BackButton />
        <h2>Review Details</h2>
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewerInfo}>
          <p className={styles.name}>{review.reviewer}</p>
          <p className={styles.date}>Posted on: {review.date || "N/A"}</p>
        </div>

        <div className={styles.reviewContent}>
          <p className={styles.service}>Service: {review.service}</p>
          <p className={styles.rating}>⭐ {review.rating} / 5</p>
          <p className={styles.comment}>“{review.comment}”</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.deleteBtn} onClick={handleDelete}>
          Delete Review
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this review?</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={handleCancel}>
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

export default ReviewPage;
