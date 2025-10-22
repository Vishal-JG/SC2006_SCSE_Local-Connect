import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ServiceUploadPage.module.css";
import BackButton from "../../components/BackButton";

const ServiceUploadPage = () => {
  const navigate = useNavigate();

  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) setMedia(file);
  };

  const handleAddService = () => {
    const newService = { serviceName, category, price, description, media };
    navigate("/ProviderUI/MyListingsPage");
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>Add New Service</h1>
        <p className={styles.subtitle}>
          Fill in the details for your new service offering
        </p>
      </div>

      {/* Top Section: Upload + Inputs */}
      <div className={styles.topSection}>
        {/* Upload Media */}
        <div className={styles.uploadContainer}>
          <label className={styles.uploadLabel}>Service Media</label>
          <label htmlFor="mediaUpload" className={styles.uploadBox}>
            {media ? (
              <img
                src={URL.createObjectURL(media)}
                alt="Preview"
                className={styles.uploadedImage}
              />
            ) : (
              <span className={styles.uploadText}>
                Click to upload service media
              </span>
            )}
            <input
              id="mediaUpload"
              type="file"
              accept="image/*"
              onChange={handleMediaUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Input Boxes */}
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
            <label className={styles.inputLabel}>Category</label>
            <input
              type="text"
              placeholder="eg: Plumbing services"
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

      {/* Add Service Button */}
      <button className={styles.addButton} onClick={handleAddService}>
        ADD SERVICE
      </button>
    </div>
  );
};

export default ServiceUploadPage;
