import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarXmark, faCalendarCheck, faStar } from '@fortawesome/free-solid-svg-icons';
import "./BookingPage.css";

const BookingPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [cancelId, setCancelId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serviceNames, setServiceNames] = useState({});
  const [serviceDetails, setServiceDetails] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);


  useEffect(() => {
    async function fetchAllServiceNames() {
        const names = {};
        const details = {};
        for (const booking of bookings) {
        if (!names[booking.listing_id]) {
            const serviceData = await fetchServiceName(booking.listing_id);
            names[booking.listing_id] = serviceData.name;
            details[booking.listing_id] = serviceData;
        }
        }
        setServiceNames(names);
        setServiceDetails(details);
    }
    if (bookings.length > 0) fetchAllServiceNames();
  }, [bookings]);
  async function fetchServiceName(listing_id) {
    const res = await fetch(`http://localhost:5000/api/services/${listing_id}`);
    if (!res.ok) {
        return { name: "Unknown Service", category_id: null };
    }
    const service = await res.json();
    return { 
      name: service.title || service.name || "Unnamed Service",
      category_id: service.category_id
    };
  }


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setMessage("You must be logged in to view your bookings.");
          setLoading(false);
          return;
        }
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:5000/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancelClick = (bookingId) => {
    setCancelId(bookingId);
    setShowConfirm(true);
  };

  const handleCancelConfirm = async () => {
    setShowConfirm(false);
    if (!cancelId) return;
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/bookings/${cancelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        setMessage(errorData.error || "Failed to cancel booking");
        return;
      }
      setBookings((prev) => prev.filter((b) => b.booking_id !== cancelId));
      setShowSuccess(true);
    } catch (error) {
      setMessage("Error cancelling booking: " + error.message);
    }
  };

  const handleCancelReject = () => {
    setShowConfirm(false);
    setCancelId(null);
  };

  const categoryTypeMap = {
    1: "personalchef",
    2: "packagedelivery",
    3: "electricianservices",
    4: "homecleaning",
    5: "automechanic",
    6: "handymanrepairs",
    7: "beautysalon",
    8: "techsupport",
    9: "privatetutoring",
    10: "plumbingservices",
  };

  const handleAddReview = (listingId) => {
    // Get the service details to construct the proper route
    const service = serviceDetails[listingId];
    if (service && service.category_id) {
      const categoryType = categoryTypeMap[service.category_id];
      navigate(`/service/${categoryType}/${listingId}`);
    } else {
      // Fallback to just the listing page if category is unknown
      navigate(`/service/${listingId}`);
    }
  };

  if (loading)
    return (
      <div className="booking-container">
        <p>Loading bookings...</p>
      </div>
    );
  if (message)
    return (
      <div className="booking-container">
        <div className="booking-message">{message}</div>
      </div>
    );
  if (bookings.length === 0)
    return (
      <div className="booking-container">
        <h2 className="booking-title">My Bookings</h2>
        <div className="empty-state">
          <div className="empty-icon">
            <FontAwesomeIcon icon={faCalendarXmark} />
          </div>
          <h3>No Bookings Yet</h3>
          <p>You haven't made any bookings. Start exploring services!</p>
          <button className="browse-btn" onClick={() => navigate('/service')}>
            <FontAwesomeIcon icon={faCalendarCheck} />
            Browse Services
          </button>
        </div>
      </div>
    );

  return (
    <div className="booking-container">
      <h2 className="booking-title">My Current Bookings</h2>
      <div className="booking-list">
        {bookings.map((booking) => (
          <div className="booking-card" key={booking.booking_id}>
            <div className="booking-info">
              <div className="booking-main">
                <h3>{serviceNames[booking.listing_id] || "Loading..."}</h3>
                <p className="booking-status">
                  Status: <span className={"status " + booking.status.toLowerCase()}>{booking.status}</span>
                </p>
              </div>
              <div className="booking-details">
                <p>
                  <span>Date:</span> {new Date(booking.booking_date).toLocaleString()}
                </p>
                <p>
                  <span>Provider:</span> {booking.provider_name || "N/A"}
                </p>
              </div>
            </div>
            <div className="booking-actions">
              {booking.status === "pending" && (
                <button className="btn danger cancel-btn" onClick={() => handleCancelClick(booking.booking_id)}>
                  Cancel
                </button>
              )}
              {booking.status === "completed" && (
                <button className="btn review-btn" onClick={() => handleAddReview(booking.listing_id)}>
                  <FontAwesomeIcon icon={faStar} />
                  Add Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Are you sure you want to cancel this booking?</p>
            <div className="confirm-buttons">
                <button className="btn danger confirm-yes" onClick={handleCancelConfirm}>
                    Yes
                </button>
                <button className="btn neutral confirm-no" onClick={handleCancelReject}>
                    No
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
