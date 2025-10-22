import React, { useState, useEffect } from 'react'
import './BookmarkUI.css'

const dummyBookmarks = [
  {
    "id": "1",
    "name": "Quick Plumbing Solutions",
    "description": "Fast and reliable plumbing services for home and commercial needs.",
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "price": "$50 - $100"
  },
  {
    "id": "2",
    "name": "Sparkle Cleaners",
    "description": "Professional cleaning services with eco-friendly products.",
    "image": "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=700&q=80",
    "price": "$70 - $150"
  },
  {
    "id": "3",
    "name": "City Cafe",
    "description": "Popular cafe with great coffee and cozy ambiance.",
    "image": "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=400&q=80",
    "price": "$5 - $15"
  },
  {
    "id": "4",
    "name": "Gourmet Bakery",
    "description": "Fresh baked goods, cakes, and pastries.",
    "image": "https://images.unsplash.com/photo-1528821167780-4f63491a6a03?auto=format&fit=crop&w=400&q=80",
    "price": "$10 - $50"
  },
  {
    "id": "5",
    "name": "Tailored Clothing",
    "description": "Custom tailoring with quick turn-around.",
    "image": "https://images.unsplash.com/photo-1549924310-cb9a1f3768d4?auto=format&fit=crop&w=400&q=80",
    "price": "$80 - $300"
  }
]

const BookmarkUI = () => {
  //state for bookmark
  const [bookmarks, setBookmarks] = useState(dummyBookmarks)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  //need to replace with real endpoints
  // useEffect(() => {
  //     fetch('http://localhost:5000/api/bookmarks', {
  //       credentials: 'include', // if using sessions or similar
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //       }
  //     })
  //       .then(res => {
  //         if (!res.ok) throw new Error("Failed to fetch bookmarks");
  //         return res.json();
  //       })
  //       .then(data => {
  //         setBookmarks(data);
  //         setLoading(false);
  //       })
  //       .catch(err => {
  //         setError(err.message);
  //         setLoading(false);
  //       });
  //   }, []);
  
  if (loading) return <div className="bookmark-container">Loading bookmarks…</div>;
  if (error) return <div className="bookmark-container error">Error: {error}</div>;
  if (bookmarks.length === 0) return <div className="bookmark-container">No bookmarks found.</div>;

  return (
    <div className="bookmark-container">
      <h1>Your Bookmarked Services</h1>
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
  )
}

export default BookmarkUI
