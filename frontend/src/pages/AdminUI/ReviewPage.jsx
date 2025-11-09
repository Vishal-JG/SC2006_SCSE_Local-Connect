import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faCalendarAlt, 
  faStar, 
  faCommentDots, 
  faTrashAlt,
  faUserMinus,
  faExclamationTriangle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
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

  const handleDeleteUser = () => {
    // Always navigate; pass state only if we have user_id
    const state = review && review.user_id ? { deleteUserId: review.user_id } : {};
    navigate('/AdminUI/AllUsersPage', { state });
  };

  if (loading) return (
    <div className={styles.reviewScreen}>
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading review details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className={styles.reviewScreen}>
      <div className={styles.errorState}>
        <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
        <p>Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.reviewScreen}>
      <div className={styles.header}>
        <BackButton to="/AdminUI/AllReviewsPage" />
        <h2>
          <FontAwesomeIcon icon={faCommentDots} /> Review Details
        </h2>
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewerInfo}>
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            <p className={styles.name}>{review.reviewer}</p>
          </div>
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
            <p className={styles.date}>{review.date || "N/A"}</p>
          </div>
        </div>

        <div className={styles.reviewContent}>
          <div className={styles.serviceSection}>
            <p className={styles.label}>Service:</p>
            <p className={styles.service}>{review.service}</p>
          </div>
          
          <div className={styles.ratingSection}>
            <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
            <span className={styles.rating}>{review.rating}</span>
            <span className={styles.ratingMax}>/ 5</span>
          </div>
          
          <div className={styles.commentSection}>
            <p className={styles.label}>Review Comment:</p>
            <p className={styles.comment}>"{review.comment}"</p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.deleteBtn} onClick={handleDelete}>
          <FontAwesomeIcon icon={faTrashAlt} />
          Delete Review
        </button>
          <button className={styles.deleteUserBtn} onClick={handleDeleteUser}>
            <FontAwesomeIcon icon={faUserMinus} />
            Delete User
          </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={handleCancel}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                <FontAwesomeIcon icon={faCheckCircle} />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
