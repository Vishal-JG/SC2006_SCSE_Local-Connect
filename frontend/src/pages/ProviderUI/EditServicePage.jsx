import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";
import { getIdToken } from "firebase/auth";
import BackButton from "../../components/BackButton";
import styles from "./EditServicePage.module.css";

const fallbackImg = "https://via.placeholder.com/160x120.png?text=Service+Image";

const EditServicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listing_id } = useParams();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // <-- image state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing service data (from state or backend)
  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in!");
        const idToken = await getIdToken(user);

        const serviceFromState = location.state?.service;
        if (serviceFromState) {
          setTitle(serviceFromState.title || "");
          setCategory(serviceFromState.category_id || "");
          setPrice(serviceFromState.price || "");
          setDescription(serviceFromState.description || "");
          setImageUrl(serviceFromState.image_url || ""); // set image from state
        } else {
          const res = await axios.get(
            `http://localhost:5000/api/services/${listing_id}`,
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
          const service = res.data;
          setTitle(service.title || "");
          setCategory(service.category_id || "");
          setPrice(service.price || "");
          setDescription(service.description || "");
          setImageUrl(service.image_url || ""); // set image from backend
        }
      } catch (err) {
        setError("Failed to load service. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [listing_id, location.state]);

  // Save updated service
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in!");
      const idToken = await getIdToken(user);

      const res = await axios.patch(
        `http://localhost:5000/api/provider/services/${listing_id}`,
        { title, category_id: category, price: parseFloat(price), description, image_url: imageUrl },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      setSuccess("Service updated successfully!");
      setTimeout(() => navigate("/ProviderUI/MyListingsPage"), 1000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to update service. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }, [listing_id, title, category, price, description, navigate]);

  // Delete service
  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in!");
      const idToken = await getIdToken(user);

      await axios.delete(
        `http://localhost:5000/api/provider/services/${listing_id}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      setSuccess("Service deleted!");
      setTimeout(() => navigate("/ProviderUI/MyListingsPage"), 1000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to delete service. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }, [listing_id, navigate]);

  if (loading) return <div className={styles.page}>Loading service...</div>;
  if (error) return <div className={styles.page}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>Edit Service</h1>
        <p className={styles.subtitle}>Update details for your service</p>
      </div>

      <div className={styles.formContainer}>
        {/* Service Image Display */}
        <div className={styles.inputContainer}>
          <label className={styles.inputLabel}>Current Image</label>
          <img
            src={imageUrl || fallbackImg}
            alt={title || "Service Image"}
            className={styles.serviceImage}
          />
        </div>

        {/* Image URL Edit */}
        <div className={styles.inputContainer}>
          <label className={styles.inputLabel}>Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Service Name */}
        <div className={styles.inputContainer}>
          <label className={styles.inputLabel}>Service Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Category */}
        <div className={styles.inputContainer}>
          <label className={styles.inputLabel}>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Price */}
        <div className={styles.inputContainer}>
          <label className={styles.inputLabel}>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Description */}
        <div className={styles.inputContainer}>
          <label className={styles.inputLabel}>Service Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
          />
        </div>

        {/* Feedback */}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {/* Save Button */}
        <button
          className={styles.addButton}
          onClick={handleSave}
          disabled={saving || deleting}
        >
          {saving ? "Saving..." : "SAVE CHANGES"}
        </button>
        {/* Delete Button */}
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={saving || deleting}
        >
          {deleting ? "Deleting..." : "DELETE SERVICE"}
        </button>
      </div>
    </div>
  );
};

export default EditServicePage;