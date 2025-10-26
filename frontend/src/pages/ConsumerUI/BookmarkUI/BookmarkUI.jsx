import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import './BookmarkUI.css';

const BookmarkUI = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

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

        const res = await fetch('http://localhost:5000/api/bookmarks', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!res.ok) throw new Error('Failed to fetch bookmarks');
        const data = await res.json();

        const mapped = data.bookmarks?.map(item => ({
          id: item.listing_id,
          name: item.title,
          description: item.description,
          image: item.image_url || 'https://via.placeholder.com/400x300',
          price: item.price ? `$${item.price.toFixed(2)}` : 'N/A'
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

  return (
    <div className="bookmark-container">
      {showNotification && (
        <div className="notification error">
          You must be logged in to view your bookmarks.
        </div>
      )}

      {loading && <div>Loading bookmarks…</div>}
      {error && <div className="error">Error: {error}</div>}
      {!loading && !error && bookmarks.length === 0 && (
        <div>No bookmarks found.</div>
      )}

      <div className="bookmark-list">
        {bookmarks.map(service => (
          <div key={service.id} className="bookmark-card">
            <img src={service.image} alt={service.name} className="bookmark-image" />
            <div className="bookmark-details">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <p className="bookmark-price">{service.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarkUI;

