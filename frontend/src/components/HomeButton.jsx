import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
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
      <FaHome /> Home
    </button>
  );
};

export default HomeButton;
