import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const BookmarkButton = ({ listingId }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch bookmark state on mount for this listing and user
  useEffect(() => {
    if (!token) return;

    const fetchBookmark = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/bookmarks/check/${listingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBookmarked(response.data.is_bookmarked);
      } catch (error) {
        setBookmarked(false);
      }
    };

    fetchBookmark();
  }, [listingId, token]);

  const toggleBookmark = async () => {
    if (!token) {
      alert("Please log in to bookmark");
      return;
    }

    setLoading(true);
    try {
      if (bookmarked) {
        // Remove bookmark
        await axios.delete(
          `http://localhost:5000/api/bookmarks/listing/${listingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookmarked(false);
      } else {
        // Add bookmark
        await axios.post(
          "http://localhost:5000/api/bookmarks",
          { listing_id: listingId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookmarked(true);
      }
    } catch (error) {
      alert("Failed to update bookmark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      title={bookmarked ? "Remove bookmark" : "Add bookmark"}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {bookmarked ? (
        <FaBookmark color="gold" size={24} />
      ) : (
        <FaRegBookmark size={24} />
      )}
    </button>
  );
};

export default BookmarkButton;
