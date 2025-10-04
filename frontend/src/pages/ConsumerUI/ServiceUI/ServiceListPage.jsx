import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./ServiceListPage.css";
import SearchBar from "../../../components/SearchBar";
import BackButton from "../../../components/BackButton";

// Dummy data with images and ratings
const dummyServices = {
  plumbing: [
    {
      id: 1,
      name: "Elco Plumbing Co.",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      name: "DrainWise Plumbing",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      name: "QuickFix Solutions",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 4,
      name: "RapidFlow Plumbing Co.",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=400&q=80",
    },
  ],
  // Add more categories later
};

const ServiceListPage = () => {
  const { type } = useParams();
  const services = dummyServices[type] || [];
  const [search, setSearch] = useState("");

  // Filter services based on search input (case-insensitive)
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  // Suggestions (just the service names for now)
  const suggestions = services.map((s) => s.name);

  return (
    <div className="service-list-page">
        <BackButton />
        <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            suggestions={suggestions}
            onSuggestionClick={(val) => setSearch(val)} // auto-fill on click
        />

        <h2 className="service-title">
            {type.charAt(0).toUpperCase() + type.slice(1)} Services
        </h2>

        <div className="service-card-grid">
            {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
                <div className="service-card" key={service.id}>
                <img
                    className="service-card-img"
                    src={service.image}
                    alt={service.name}
                />
                <div className="service-card-content">
                    <h3>{service.name}</h3>
                    <div className="service-card-rating">
                    <span role="img" aria-label="star">
                        ⭐
                    </span>{" "}
                    {service.rating}
                    </div>
                    <button className="service-card-btn">View details</button>
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

