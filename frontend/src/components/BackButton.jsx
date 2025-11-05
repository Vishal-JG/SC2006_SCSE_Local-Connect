import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

// Optional `to` prop: when provided, navigate to that path; otherwise go back in history
const BackButton = ({ to }) => {
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