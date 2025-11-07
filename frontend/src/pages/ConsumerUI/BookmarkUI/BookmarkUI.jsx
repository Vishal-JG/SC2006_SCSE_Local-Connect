import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faDollarSign, faStar, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import "./BookmarkUI.css";

const DEFAULT_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

const categoryMap = {
  "personal chef": 1,
  "package delivery": 2,
  "electrician services": 3,
  "home cleaning": 4,
  "auto mechanic": 5,
  "handyman repairs": 6,
  "beauty salon": 7,
  "tech support": 8,
  "private tutoring": 9,
  "plumbing services": 10
};

const reverseCategoryMap = Object.entries(categoryMap).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

const BookmarkUI = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setShowNotification(true);
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();

        const res = await fetch("http://localhost:5000/api/bookmarks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch bookmarks");
        const data = await res.json();

        const mapped =
          data.bookmarks?.map((item) => ({
            id: item.listing_id,
            name: item.title,
            description: item.description,
            image: item.image_url || DEFAULT_IMAGE,
            price: item.price ? `$${item.price.toFixed(2)}` : "N/A",
            categoryId: categoryMap[item.category_name?.toLowerCase()] || 0,
          })) || [];

        setBookmarks(mapped);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  // Hide notification automatically after 5 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleCardClick = (listingId) => {
    const bookmark = bookmarks.find((b) => b.id === listingId);
    const categoryId = bookmark?.categoryId || 0;
    const categoryName = reverseCategoryMap[categoryId] || "unknowncategory";
    const url = `/service/${encodeURIComponent(categoryName)}/${listingId}`;
    
    navigate(url);
  };

  return (
    <div className="bookmark-container">
      <div className="bookmark-header">
        <h1>My Bookmarks</h1>
      </div>

      {showNotification && (
        <div className="notification error">
          <FontAwesomeIcon icon={faStar} className="notification-icon" />
          You must be logged in to view your bookmarks.
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your bookmarks...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && bookmarks.length === 0 && (
        <div className="empty-state">
          <FontAwesomeIcon icon={faBoxOpen} className="empty-icon" />
          <h2>No Bookmarks Yet</h2>
          <p>Start exploring services and save your favorites here!</p>
          <button className="browse-btn" onClick={() => navigate('/service')}>
            Browse Services
          </button>
        </div>
      )}

      <div className="bookmark-list">
        {bookmarks.map((service) => (
          <div
            key={service.id}
            className="bookmark-card"
            onClick={() => handleCardClick(service.id)}
            tabIndex={0}
            role="button"
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") handleCardClick(service.id);
            }}
          >
            <div className="bookmark-image-wrapper">
              <img
                src={service.image}
                alt={service.name}
                className="bookmark-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
              <div className="bookmark-overlay">
                <FontAwesomeIcon icon={faBookmark} className="bookmark-icon" />
              </div>
            </div>
            <div className="bookmark-details">
              <h3>{service.name}</h3>
              <p className="bookmark-description">{service.description}</p>
              <div className="bookmark-footer">
                <span className="bookmark-price">
                  <FontAwesomeIcon icon={faDollarSign} />
                  {service.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarkUI;
