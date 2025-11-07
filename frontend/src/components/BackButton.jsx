import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

// Optional `to` prop: when provided, navigate to that path; otherwise go back in history
// Optional `variant` prop: "glass" (default) or "solid" for different styles
const BackButton = ({ to, variant = "glass" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`back-button ${variant === "solid" ? "back-button-solid" : ""}`}
      aria-label="Go back"
    >
      <FaArrowLeft className="back-button-icon" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;