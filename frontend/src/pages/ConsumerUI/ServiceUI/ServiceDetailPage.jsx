import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import BookmarkButton from "../../../components/Bookmark";
import { FaMapMarkerAlt, FaStar, FaWhatsapp, FaCalendarAlt } from "react-icons/fa";
import BookingOverlay from "../BookingUI/BookingOverlay"; // your overlay component
import ReviewSection from "../../../components/ReviewSection";
import "./ServiceDetailPage.css";

const categoryMap = {
  personalchef: 1,
  packagedelivery: 2,
  electricianservices: 3,
  homecleaning: 4,
  automechanic: 5,
  handymanrepairs: 6,
  beautysalon: 7,
  techsupport: 8,
  privatetutoring: 9,
  plumbingservices: 10,
};

const ServiceDetailPage = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const getDemoRating = (id) => {
    const seed = id * 9301 + 49297;
    const random = (seed % 233280) / 233280;
    return (4 + random).toFixed(1);
  };

  // Fetch service and initial average rating
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, averagesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/services/${id}`),
          fetch(`http://localhost:5000/api/reviews/averages`),
        ]);

        if (!serviceRes.ok) throw new Error("Service not found");

        const serviceData = await serviceRes.json();
        const averages = await averagesRes.json();

        const avgMap = {};
        averages.forEach((a) => {
          avgMap[a.listing_id] = a.avg_rating;
        });

        const rating =
          avgMap[serviceData.listing_id] ?? getDemoRating(serviceData.listing_id);

        setService({ ...serviceData, avg_rating: rating });
      } catch (err) {
        console.error(err);
        setService(null);
      }
    };

    fetchData();
  }, [id]);

  // Function to refresh average rating when a new review is added
  const fetchAverageRating = async () => {
    if (!service) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/averages`);
      if (!res.ok) return;
      const averages = await res.json();
      const avg = averages.find(a => a.listing_id === service.listing_id)?.avg_rating;
      if (avg) setService(prev => ({ ...prev, avg_rating: avg }));
    } catch (err) {
      console.error("Failed to fetch average rating", err);
    }
  };

  if (!service) {
    return (
      <div className="service-detail-bg centered">
        <div className="service-detail-panel">Service not found.</div>
      </div>
    );
  }

  const isHomeCleaning =
    type?.toLowerCase().replace(/\s+/g, "") === "homecleaning" ||
    service.category_id === categoryMap.homecleaning;

  return (
    <div className="service-detail-page modern-layout">
      <BackButton />

      {/* Banner with bookmark */}
      <div
        className="service-banner"
        style={{ backgroundImage: `url(${service.image_url})` }}
      >
        <BookmarkButton listingId={service.listing_id} />
      </div>
      <div className="service-info-card">
        <div className="service-info">
          <h1 className="service-title">{service.title || service.name}</h1>

          {/* Rating */}
          <div className="rating-row">
            <FaStar className="star-icon" />
            <span className="rating-score">{service.avg_rating}</span>
            <span className="rating-text">/ 5</span>
          </div>

          {/* Location */}
          {service.location && (
            <div className="location-row">
              <FaMapMarkerAlt
                className="location-icon"
                onClick={() => navigate("/map")}
                title="View on Map"
              />
              <span>{service.location}</span>
            </div>
          )}

          <p className="service-description">{service.description}</p>

          <p className="service-price">
            <b>Price:</b> ${service.price || "50 - 60"}
          </p>

          {/* Actions Row */}
          <div className="actions-row" style={{ flexWrap: "wrap", gap: "12px" }}>
            {/* Home cleaning → Recycling Points */}
            {isHomeCleaning && (
              <button
                className="action-btn action-btn--secondary recycling-btn"
                onClick={() => navigate("map")}
              >
                ♻️ Show Recycling Points
              </button>
            )}

            {/* Other services with location → View on Map */}
            {!isHomeCleaning && service.latitude && service.longitude && (
              <button
                className="action-btn action-btn--map action-btn--primary location-btn"
                onClick={() => navigate("map")}
              >
                📍 View on Map
              </button>
            )}

            {/* WhatsApp Contact */}
            <button
              className="action-btn action-btn--whatsapp"
              onClick={() => {
                const phoneNumber = "+60197123431"; 
                const message = encodeURIComponent(
                  `Hello, I'm interested in your service: ${service.title || service.name}`
                );
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
              }}
            >
              <FaWhatsapp style={{ marginRight: "8px" }} />
              Contact via WhatsApp
            </button>

            {/* Book Now */}
            <button
              className="action-btn action-btn--primary booknow-btn"
              onClick={() => setIsBookingOpen(true)}
            >
              <FaCalendarAlt style={{ marginRight: "8px" }} />
              Book Now
            </button>
          </div>
        </div>
      </div>
      {/* Booking overlay */}
      <BookingOverlay
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        listingId={service.listing_id}
        userId={parseInt(localStorage.getItem("userId"))}
      />

      {/* Reviews */}
      <ReviewSection
        listingId={service.listing_id}
        currentAvgRating={service.avg_rating}
        onAverageRatingChange={(newAvg) =>
          setService((prev) => ({ ...prev, avg_rating: newAvg }))
        }
      />
    </div>
  );
};

export default ServiceDetailPage;
