import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./BookingOverlay.css";

const BookingOverlay = ({ isOpen, onClose, listingId, userId }) => {
  const [mounted, setMounted] = useState(false);
  const [minDateTime, setMinDateTime] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set the minimum date to "now"
  useEffect(() => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:mm (for datetime-local input)
    const formatted = now.toISOString().slice(0, 16);
    setMinDateTime(formatted);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleConfirm = async () => {
    if (!bookingDate) {
      alert("Please select a date and time.");
      return;
    }

    // Validate that the selected date is not in the past
    if (new Date(bookingDate) < new Date()) {
      alert("Please select a future date and time.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please log in to make a booking.");
        onClose();
        return;
      }

      const formattedDate = bookingDate.replace("T", " ") + ":00";
      console.log("JWT Token used:", token);
      console.log("POST body:", { listingId, formattedDate, userId });
      // Make API call to create booking
      const response = await axios.post(
        'http://localhost:5000/api/bookings', // Adjust URL to match your backend
        {
          listing_id: parseInt(listingId),
          user_id: parseInt(userId),
          booking_date: formattedDate
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert("Booking created successfully!");
        setBookingDate(""); // Reset form
        onClose();
      } else {
        alert(`Booking failed: ${response.data.error}`);
      }

    } catch (error) {
      console.error("Booking error:", error);
      
      if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data?.error || "Failed to create booking";
        alert(`Error: ${errorMessage}`);
      } else if (error.request) {
        // Network error
        alert("Network error. Please check your connection.");
      } else {
        // Other error
        alert("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setBookingDate(""); // Reset form when canceling
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="booking-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="booking-modal"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <h2>Book Appointment</h2>

            <label>Select Date & Time</label>
            <input 
              type="datetime-local" 
              min={minDateTime}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="button-row">
              <button 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BookingOverlay;
