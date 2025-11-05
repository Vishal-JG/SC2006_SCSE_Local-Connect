import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";
import { getIdToken } from "firebase/auth";
import styles from "./ServiceUploadPage.module.css";
import BackButton from "../../components/BackButton";

const ServiceUploadPage = () => {
  const navigate = useNavigate();

  // Form state
  const [serviceName, setServiceName] = useState("");
  const [categoryId, setCategoryId] = useState(""); // Should be an ID matching backend
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle add service (POST to backend)
  const handleAddService = async () => {
    setError("");
    setLoading(true);

    // Basic frontend validation
    if (!serviceName || !price || !description || !categoryId) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in!");
      const idToken = await getIdToken(user);

      const payload = {
        title: serviceName,
        category_id: parseInt(categoryId), // Must be integer for backend
        price: parseFloat(price), // Convert string to float
        description,
      };

      await axios.post("http://localhost:5000/api/provider/services", payload, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      navigate("/ProviderUI/MyListingsPage");
    } catch (err) {
      console.error("Add service error:", err);
      setError(err.response?.data?.error || "Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>Add New Service</h1>
        <p className={styles.subtitle}>Fill in the details for your new service offering</p>
      </div>

      <div className={styles.topSection}>
        <div className={styles.inputsContainer}>
          {/* Service Name */}
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Service Name</label>
            <input
              type="text"
              placeholder="eg: Elco Plumbing Co."
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Category */}
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Category ID</label>
            <input
              type="number"
              placeholder="eg: 1"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={styles.input}
            />
            {/* Optional: dropdown with categories if fetched from backend */}
          </div>

          {/* Price */}
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Price</label>
            <input
              type="number"
              step="0.01"
              placeholder="$ 0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Service Description</label>
        <textarea
          placeholder="Describe your service in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
        />
      </div>

      {/* Error Message */}
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

      {/* Add Service Button */}
      <button className={styles.addButton} onClick={handleAddService} disabled={loading}>
        {loading ? "ADDING..." : "ADD SERVICE"}
      </button>
    </div>
  );
};

export default ServiceUploadPage;