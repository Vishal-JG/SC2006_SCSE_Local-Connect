import React, { useState } from "react";
import "./navBar.css";
import logo from "../assets/logo.png"; // Import the image
import bookmark from "../assets/bookmark.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const NavBar = () => {
  const [menu, setMenu] = useState("home");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      // Optionally show profile or logout
      logout();
    }
  };

  return (
    <div className="navbar">
      <img className="nav-left" src={logo} alt="logo" />
      <div className="nav-middle">
        <ul>
          <li
            onClick={() => setMenu("home")}
            className={menu === "home" ? "active" : ""}
          >
            Home
          </li>
          <li
            onClick={() => setMenu("about")}
            className={menu === "about" ? "active" : ""}
          >
            About
          </li>
          <li
            onClick={() => setMenu("contact")}
            className={menu === "contact" ? "active" : ""}
          >
            Contact Us
          </li>
          <li
            onClick={() => setMenu("services")}
            className={menu === "services" ? "active" : ""}
          >
            Services
          </li>
          <li
            onClick={() => setMenu("bookmarks")}
            className={menu === "bookmarks" ? "active" : ""}
          >
            <img
              className="bookmark-icon"
              src={bookmark}
              alt="bookmark icon"
            ></img>
          </li>
        </ul>
      </div>
      <div className="nav-right">
        <ul>
          <li>Profile</li>
          <button onClick={handleLoginClick}>
            {user ? "Logout" : "Login/Sign-up"}
          </button>
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
