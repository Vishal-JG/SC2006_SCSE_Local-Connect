import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)} 
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "transparent",
        border: "none",
        color: "#4a90e2",
        fontSize: "16px",
        cursor: "pointer",
      }}
    >
      <FaArrowLeft /> Back
    </button>
  );
};

export default BackButton;