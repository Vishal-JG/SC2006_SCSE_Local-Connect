import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import styles from "./AllReviewsPage.module.css";

const AllReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/reviews");
        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await res.json();
        setReviews(data);
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

  if (loading) return <div className={styles.allReviews}>Loading...</div>;
  if (error) return <div className={styles.allReviews}>Error: {error}</div>;

  return (
    <div className={styles.allReviews}>
      <div className={styles.header}>
        <BackButton />
        <h2>All Reviews</h2>
      </div>

      <div className={styles.reviewList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.card}>
            <div className={styles.topRow}>
              <h3 className={styles.name}>{review.reviewer}</h3>
              <span className={styles.rating}>⭐ {review.rating}/5</span>
            </div>
            <p className={styles.service}>Service: {review.service}</p>
            <p className={styles.comment}>{review.comment}</p>
            <div style={{ marginTop: "10px" }}>
              <button onClick={() => handleReviewClick(review.id)}>View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllReviewsPage;
