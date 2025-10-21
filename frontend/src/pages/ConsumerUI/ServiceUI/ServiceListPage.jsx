import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ServiceListPage.css";
import SearchBar from "../../../components/SearchBar";
import BackButton from "../../../components/BackButton";

const ServiceListPage = () => {
  const { type } = useParams();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/services")  // Flask endpoint from service_bp
      .then((response) => response.json())
      .then((data) => {
        // Optional: filter by service category name
        const normalizedType = type.toLowerCase().replace(/\s+/g, "");
        const filteredData = data.filter((s) =>
          s.title.toLowerCase().includes(normalizedType)
        );
        setServices(filteredData);
      })
      .catch((error) => console.error("Error fetching services:", error));
  }, [type]);

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="service-list-page">
      <BackButton />
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        suggestions={services.map((s) => s.title)}
        onSuggestionClick={(val) => setSearch(val)}
      />
      <h2 className="service-title">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </h2>
      <div className="service-card-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div className="service-card" key={service.listing_id}>
              <img
                className="service-card-img"
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                alt={service.title}
              />
              <div className="service-card-content">
                <h3>{service.title}</h3>
                <p>${service.price}</p>
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
