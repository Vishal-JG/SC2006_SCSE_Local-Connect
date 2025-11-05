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
        color: "white",
        fontSize: "16px",
        cursor: "pointer",
        margin: "10px"
      }}
    >
      <FaArrowLeft /> Back
    </button>
  );
};

export default BackButton;