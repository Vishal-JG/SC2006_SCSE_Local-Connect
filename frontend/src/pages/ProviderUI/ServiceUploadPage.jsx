import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";
import { getIdToken } from "firebase/auth";
import styles from "./ServiceUploadPage.module.css";
import BackButton from "../../components/BackButton";
import { Back, FilePlus } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const ServiceUploadPage = () => {
  const navigate = useNavigate();

  // Categories mapping
  const categories = [
    { id: 1, name: "Personal Chef", value: "personalchef" },
    { id: 2, name: "Package Delivery", value: "packagedelivery" },
    { id: 3, name: "Electrician Services", value: "electricianservices" },
    { id: 4, name: "Home Cleaning", value: "homecleaning" },
    { id: 5, name: "Auto Mechanic", value: "automechanic" },
    { id: 6, name: "Handyman Repairs", value: "handymanrepairs" },
    { id: 7, name: "Beauty Salon", value: "beautysalon" },
    { id: 8, name: "Tech Support", value: "techsupport" },
    { id: 9, name: "Private Tutoring", value: "privatetutoring" },
    { id: 10, name: "Plumbing Services", value: "plumbingservices" },
  ];

  // Form state
  const [serviceName, setServiceName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Default map center (Singapore)
  const defaultCenter = [1.3521, 103.8198];

  // Handle add service (POST to backend)
  const handleAddService = async () => {
    setError("");
    setLoading(true);

    // Basic frontend validation
    if (!serviceName || !price || !description || !categoryId) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in!");
      const idToken = await getIdToken(user);

      const payload = {
        title: serviceName,
        category_id: parseInt(categoryId),
        price: parseFloat(price),
        description,
        image_url: imageUrl || "https://via.placeholder.com/400x300?text=No+Image",
        location: location || null,
        latitude: latitude,
        longitude: longitude,
      };

      await axios.post("http://localhost:5000/api/provider/services", payload, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      alert("✅ Service added successfully!");
      navigate("/ProviderUI/MyListingsPage");
    } catch (err) {
      console.error("Add service error:", err);
      setError(err.response?.data?.error || "Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Map click handler component
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        setLatitude(lat);
        setLongitude(lng);
      },
    });

    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>
          <FilePlus size={24} /> Add New Service
        </h1>
        <p className={styles.subtitle}>Fill in the details for your new service offering</p>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formGrid}>
          {/* Service Name */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Service Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Professional Home Cleaning"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Category Dropdown */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Category <span className={styles.required}>*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={styles.select}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Price (SGD) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Location Name */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Location Name</label>
            <input
              type="text"
              placeholder="e.g., Downtown Singapore, Orchard Road"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        {/* Map for Pin Location */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            📍 Pin Your Location
          </label>
          <p className={styles.helperText}>
            Click on the map to set your service location. This helps customers find you easily.
          </p>
          <div className={styles.mapContainer}>
            <MapContainer
              center={defaultCenter}
              zoom={12}
              style={{ height: "400px", width: "100%", borderRadius: "12px" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
          </div>
          {latitude && longitude && (
            <div className={styles.coordsDisplay}>
              <span className={styles.coordLabel}>Latitude:</span> {latitude.toFixed(6)} 
              <span className={styles.coordSeparator}>|</span>
              <span className={styles.coordLabel}>Longitude:</span> {longitude.toFixed(6)}
            </div>
          )}
        </div>

        {/* Image URL */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Service Image URL</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={styles.input}
          />
          <p className={styles.helperText}>
            Paste a URL to an image of your service. Leave blank for default placeholder.
          </p>
          {imageUrl && (
            <div className={styles.imagePreview}>
              <img src={imageUrl} alt="Preview" className={styles.previewImage} />
            </div>
          )}
        </div>

        {/* Description */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Service Description <span className={styles.required}>*</span>
          </label>
          <textarea
            placeholder="Describe your service in detail... What makes your service unique? What can customers expect?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            rows={6}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            ⚠️ {error}
          </div>
        )}

        {/* Add Service Button */}
        <button className={styles.submitButton} onClick={handleAddService} disabled={loading}>
          {loading ? <span className={styles.spinner}></span> : <FilePlus size={20} />}
          <span>Add Service</span>
        </button>
      </div>
    </div>
  );
};

export default ServiceUploadPage;