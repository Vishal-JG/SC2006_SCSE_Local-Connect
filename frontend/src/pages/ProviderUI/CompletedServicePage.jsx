import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./CompletedServicePage.module.css";
import BackButton from "../../components/BackButton";

const CompletedServicePage = () => {
  const { id } = useParams(); // listing_id from route
  const location = useLocation();
  const [service, setService] = useState(location.state?.service || null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceAndReviews = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching reviews for listing_id:", id);
        console.log("Service from state:", service);
        
        // If service not passed via state, use the ID from params
        if (!service && id) {
          setService({ listing_id: id, title: "Service" });
        }

        // Fetch all reviews for this listing
        const reviewsUrl = `http://localhost:5000/api/services/${id}/reviews`;
        console.log("Fetching from URL:", reviewsUrl);
        const reviewsResponse = await axios.get(reviewsUrl);

        console.log("Reviews response:", reviewsResponse.data);
        console.log("Reviews response type:", typeof reviewsResponse.data);
        console.log("Reviews response is array?", Array.isArray(reviewsResponse.data));

        const reviewsList = reviewsResponse.data || [];
        setReviews(reviewsList);
        console.log("Reviews set:", reviewsList);

        // Fetch average rating from the backend (pre-calculated)
        const ratingsResponse = await axios.get(
          `http://localhost:5000/api/reviews/averages`
        );

        console.log("Ratings response:", ratingsResponse.data);

        // Find the rating for this specific listing
        const listingRating = ratingsResponse.data.find(
          (item) => item.listing_id === parseInt(id)
        );

        console.log("Found rating for this listing:", listingRating);

        if (listingRating) {
          setAverageRating(listingRating.avg_rating);
        } else {
          setAverageRating(0);
        }

      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        console.error("Error details:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceAndReviews();
    }
  }, [id, service]);

  if (loading) return <div className={styles.page}>Loading...</div>;
  if (!service) return <div className={styles.page}>Service not found</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>Completed Service Details</h1>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Service Name</p>
            <p className={styles.statValue}>{service.title || service.name || "N/A"}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Average Rating</p>
            <p className={styles.statValue}>
              {averageRating > 0 ? averageRating : "N/A"}
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💬</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Reviews</p>
            <p className={styles.statValue}>{reviews.length}</p>
          </div>
        </div>
      </div>

      {/* Show all reviews */}
      <div className={styles.reviewsSection}>
        <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div className={styles.noReviews}>
            <p>No reviews yet. Complete more services to receive feedback!</p>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review.review_id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.avatarCircle}>
                      {(review.reviewer || "A").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={styles.reviewerName}>{review.reviewer || "Anonymous"}</p>
                      <p className={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={styles.ratingBadge}>
                    <span className={styles.ratingNumber}>{review.rating}</span>
                    <span className={styles.ratingStar}>⭐</span>
                  </div>
                </div>
                <p className={styles.comment}>{review.comment || "No comment provided"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedServicePage;
