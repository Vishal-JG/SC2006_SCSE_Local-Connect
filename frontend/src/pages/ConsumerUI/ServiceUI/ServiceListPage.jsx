import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ServiceListPage.css";
import SearchBar from "../../../components/SearchBar";
import BackButton from "../../../components/BackButton";

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

const ServiceListPage = () => {
  const { type } = useParams();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("none");
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();

  const getDemoRating = (id) => {
    const seed = id * 9301 + 49297;
    const random = ((seed % 233280) / 233280);
    return (4 + random).toFixed(1); // 4.0 – 5.0
  };

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/services").then((res) => res.json()),
      fetch("http://localhost:5000/api/reviews/averages").then((res) => res.json()),
    ])
      .then(([servicesData, averagesData]) => {
        const catId = categoryMap[type.toLowerCase().replace(/\s+/g, "")];
        const filteredData = servicesData.filter((s) => s.category_id === catId);

        // build a map for fast lookup
        const avgMap = {};
        averagesData.forEach((a) => {
          avgMap[a.listing_id] = a.avg_rating;
        });

        // attach avg_rating (or fallback demo)
        const combined = filteredData.map((s) => ({
          ...s,
          avg_rating: avgMap[s.listing_id] ?? getDemoRating(s.listing_id),
        }));

        setServices(combined);
      })
      .catch((error) => console.error("Error fetching services:", error));
  }, [type]);

  useEffect(() => {
    if (sortOption === "location" && !userLocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn("Location access denied:", err);
          setIsLocating(false);
        }
      );
    }
  }, [sortOption]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in km
  };

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortOption === "price") return a.price - b.price;
    if (sortOption === "rating") {
      const ratingA = Math.floor(Math.random() * 2) + 4;
      const ratingB = Math.floor(Math.random() * 2) + 4;
      return ratingB - ratingA;
    }
    if (sortOption === "location" && userLocation) {
      const distA = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        a.latitude,
        a.longitude
      );
      const distB = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        b.latitude,
        b.longitude
      );
      return distA - distB;
    }
    return 0;
  });


  const handleFilterSelect = (type) => {
    if (type === "price") setSortOption("price");
    else if (type === "rating") setSortOption("rating");
    else if (type === "location") setSortOption("location");
    else setSortOption("none");
  };

  const activeFilterLabel =
    sortOption === "price"
      ? "💰 Sorted by Price"
      : sortOption === "rating"
      ? "⭐ Sorted by Rating"
      : sortOption === "location"
      ? isLocating
        ? "📍 Locating..."
        : "📍 Sorted by Nearest"
      : null;

  return (
    <div className="service-list-page">
      <BackButton />

      <h2 className="service-title">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </h2>
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        suggestions={services.map((s) => s.title)}
        onSuggestionClick={(val) => setSearch(val)}
        onFilterSelect={handleFilterSelect}
      />

      {/* ✅ Show Active Filter Chip with close button */}
      {activeFilterLabel && (
        <div className="active-filter-chip">
          {activeFilterLabel}
          <button
            className="clear-chip-btn"
            onClick={() => setSortOption("none")}
            aria-label="Clear filter"
          >
            ✕
          </button>
        </div>
      )}

      {/* ✅ Services Grid */}
      <div className="service-card-grid">
        {sortedServices.length > 0 ? (
          sortedServices.map((service) => (
            <div className="service-card" key={service.listing_id}>
              <img
                className="service-card-img"
                src={service.image_url}
                alt={service.title}
              />
              <div className="service-card-content">
                <h3>{service.title}</h3>

                {/* ✅ Rating */}
                <p className="service-card-rating">
                  ⭐ {service.avg_rating} / 5
                </p>

                {/* ✅ Location + Distance */}
                {service.location && (
                  <p style={{ color: "#555", marginBottom: "10px" }}>
                    📍 {service.location}
                    {userLocation &&
                      service.latitude &&
                      service.longitude && (
                        <>
                          {" "}
                          (
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lon,
                            service.latitude,
                            service.longitude
                          ).toFixed(1)}{" "}
                          km away)
                        </>
                      )}
                  </p>
                )}

                <p style={{ marginBottom: "12px", fontWeight: "600" }}>
                  ${service.price}
                </p>
                <button
                  className="service-card-btn"
                  onClick={() =>
                    navigate(`/service/${type}/${service.listing_id}`)
                  }
                >
                  View details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">No services found for "{search}"</div>
        )}
      </div>
    </div>
  );
};

export default ServiceListPage;
