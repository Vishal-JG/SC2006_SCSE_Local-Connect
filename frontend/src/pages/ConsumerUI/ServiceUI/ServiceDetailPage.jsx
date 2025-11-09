import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import BookmarkButton from "../../../components/Bookmark";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faCalendarAlt, faRecycle, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import BookingOverlay from "../BookingUI/BookingOverlay";
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
      <BackButton to={type ? `/service/${type}` : "/service"} />

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

          {/* Rating & Price Row */}
          <div className="info-badges">
            <div className="rating-badge">
              <FontAwesomeIcon icon={faStar} />
              <span>{service.avg_rating} / 5</span>
            </div>
            <div className="price-badge">
              <FontAwesomeIcon icon={faDollarSign} />
              <span>${service.price || "50 - 60"}</span>
            </div>
          </div>

          {/* Location */}
          {service.location && (
            <div className="location-row">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
              <span>{service.location}</span>
            </div>
          )}

          <p className="service-description">{service.description}</p>

          {/* Actions Row */}
          <div className="actions-row">
            {/* Home cleaning → Recycling Points */}
            {isHomeCleaning && (
              <button
                className="action-btn recycling-btn"
                onClick={() => navigate("map")}
              >
                <FontAwesomeIcon icon={faRecycle} />
                Recycling Points
              </button>
            )}

            {/* Other services with location → View on Map */}
            {!isHomeCleaning && service.latitude && service.longitude && (
              <button
                className="action-btn map-btn"
                onClick={() => navigate("map")}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                View on Map
              </button>
            )}

            {/* WhatsApp Contact */}
            <button
              className="action-btn whatsapp-btn"
              onClick={() => {
                const phoneNumber = "+60197123431"; 
                const message = encodeURIComponent(
                  `Hello, I'm interested in your service: ${service.title || service.name}`
                );
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
              }}
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              WhatsApp
            </button>

            {/* Book Now */}
            <button
              className="action-btn book-btn"
              onClick={() => setIsBookingOpen(true)}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
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
