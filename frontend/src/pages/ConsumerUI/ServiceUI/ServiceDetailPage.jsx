import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import BookmarkButton from "../../../components/Bookmark";
import "./ServiceDetailPage.css";

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);

  useEffect(() => {
      fetch(`http://localhost:5000/api/services/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Service not found");
          return res.json();
        })
        .then((data) => setService(data))
        .catch(() => setService(null));
  }, [id]);

  if (!service) {
    return (
      <div className="service-detail-bg centered">
        <div className="service-detail-panel">Service not found.</div>
      </div>
    );
  }

  return (
    <div className="service-detail-page modern-layout">
      <BackButton />
      
      <div className="service-banner" style={{ backgroundImage: `url(${service.image_url})` }}>
        <BookmarkButton listingId={service.listing_id} />
      </div>

      <div className="service-info">
        <h1 className="service-title">{service.name}</h1>
        <p className="service-rating">⭐ {service.rating}</p>
        <p className="service-description">{service.description}</p>
        <p className="service-price"><b>Price range:</b> {service.price || "$50 - $60"}</p>

        <div className="actions-row">
          <button onClick={() => navigate("map")} className="location-btn">
            📍 Location
          </button>
          <button className="info-btn">More info →</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
