import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styles from "./EditServicePage.module.css";
import BackButton from "../../components/BackButton";

const EditServicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const serviceFromState = location.state?.service;

  // Fallback service if none provided
  const fallbackService = {
    id,
    name: "Elco Plumbing Co.",
    category: "Plumbing",
    price: "120",
    description: "Professional plumbing services with 24/7 support.",
    imageUrl: "/assets/sample1.png",
  };

  const serviceToUse = serviceFromState || fallbackService;

  // Form state
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);

  useEffect(() => {
    setServiceName(serviceToUse.name || "");
    setCategory(serviceToUse.category || "");
    setPrice(serviceToUse.price || "");
    setDescription(serviceToUse.description || "");
    setMedia(serviceToUse.imageUrl || null);
  }, [serviceToUse]);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) setMedia(file);
  };

  const handleSaveChanges = () => {
    const updatedService = { id, serviceName, category, price, description, media };
    console.log("Service updated (ready for backend):", updatedService);

    // TODO: send PUT/PATCH request to backend

    navigate("/ProviderUI/MyListingsPage");
  };

  const handleDelete = () => {
    console.log("Service deleted:", id);
    // TODO: send DELETE request to backend
    navigate("/ProviderUI/MyListingsPage");
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>Edit Service</h1>
        <p className={styles.subtitle}>Update the details of your service</p>
      </div>

      {/* Media Upload */}
      <div className={styles.uploadContainer}>
        <label htmlFor="mediaUpload" className={styles.uploadBox}>
          {media ? (
            typeof media === "string" ? (
              <img src={media} alt="Service" className={styles.uploadedImage} />
            ) : (
              <img src={URL.createObjectURL(media)} alt="Preview" className={styles.uploadedImage} />
            )
          ) : (
            <span className={styles.uploadText}>Click to upload service media</span>
          )}
          <input
            id="mediaUpload"
            type="file"
            accept="image/*"
            onChange={handleMediaUpload}
            style={{ display: "none" }}
          />
        </label>
        <span className={styles.uploadLabel}>Service Media</span>
      </div>

      {/* Service Name */}
      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Service Name</label>
        <input
          type="text"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
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

      {/* Buttons */}
      <div className={styles.buttonGroup}>
        <button className={styles.saveButton} onClick={handleSaveChanges}>
          SAVE CHANGES
        </button>
        <button className={styles.deleteButton} onClick={handleDelete}>
          DELETE SERVICE
        </button>
      </div>
    </div>
  );
};

export default EditServicePage;