import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import "./ReviewSection.css";

const ReviewSection = ({ listingId, currentAvgRating, onAverageRatingChange }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const [userBookings, setUserBookings] = useState([]);
  const [canReview, setCanReview] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/services/${listingId}/all-reviews`
        );
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [listingId]);

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUserBookings(data.bookings);
          const bookingForThisService = data.bookings.find(
            (b) => b.listing_id === listingId
          );
          setCanReview(Boolean(bookingForThisService));
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };
    fetchBookings();
  }, [listingId, token]);

  const handleSubmitReview = async () => {
    if (!newRating || !newComment.trim()) {
      alert("Please provide a rating and comment.");
      return;
    }

    const bookingForThisService = userBookings.find(
      (b) => b.listing_id === listingId
    );

    if (!bookingForThisService) {
      alert("You need to book this service before leaving a review.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/services/${listingId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            booking_id: bookingForThisService.booking_id,
            user_id: currentUserId,
            rating: newRating,
            comment: newComment.trim(),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Append new review
        const updatedReviews = [data, ...reviews];
        setReviews(updatedReviews);

        // Compute new average rating
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = (totalRating / updatedReviews.length).toFixed(1);

        // Update parent with new average
        if (onAverageRatingChange) onAverageRatingChange(Number(avgRating));

        setNewRating(0);
        setNewComment("");
      } else {
        alert(`Error: ${data.error || "Failed to add review"}`);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Something went wrong while submitting the review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="review-loading">Loading reviews...</p>;

  return (
    <div className="review-section">
      <h3 className="review-section-title">
        Customer Reviews ({reviews.length})
      </h3>

      {reviews.length === 0 && (
        <p className="review-empty">No reviews yet for this service.</p>
      )}

      {reviews.map((review) => (
        <div className="review-card" key={review.review_id}>
          <div className="review-header">
            <span className="review-user">
              {review.reviewer || `User ${review.user_id}`}
            </span>
            <div className="review-rating">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  color={i < review.rating ? "#ffcc00" : "#ccc"}
                  size={14}
                />
              ))}
            </div>
          </div>
          <p className="review-comment">{review.comment}</p>
          <span className="review-date">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}

      {canReview && (
        <div className="add-review-form">
          <h4>Add Your Review</h4>
          <div className="rating-input">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={24}
                color={i < newRating ? "#ffcc00" : "#ccc"}
                onClick={() => setNewRating(i + 1)}
                style={{ cursor: "pointer", marginRight: "4px" }}
              />
            ))}
          </div>
          <textarea
            placeholder="Write your review..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <button
            className="submit-review-btn"
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
