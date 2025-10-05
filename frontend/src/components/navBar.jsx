import React, { useState } from "react";
import "./navBar.css";
import logo from "../assets/logo.png";
import bookmark from "../assets/bookmark.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const menuItems = [
  { label: "About", page: "about" },
  { label: "Contact Us", page: "contact" },
  { label: "Services", page: "service" },
  { label: "Bookmark", page: "bookmark" },
];

const NavBar = () => {
  const [menu, setMenu] = useState("home");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (page) => {
    setMenu(page);
    navigate(page === "home" ? "/" : `/${page}`);
  };
  const handleLoginClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      logout();
    }
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <img
        className="nav-left"
        src={logo}
        alt="App logo"
        onClick={() => handleNavigation("home")}
        style={{ cursor: "pointer" }}
      />
      <div className="nav-middle">
        <ul>
          {menuItems.map(({ label, page }) => (
            <li
              key={page}
              onClick={() => handleNavigation(page)}
              className={menu === page ? "active" : ""}
              tabIndex="0"
              style={{ cursor: "pointer" }}
              aria-label={typeof label === "string" ? label : "bookmark"}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="nav-right">
        <ul>
          <li key="profile" 
          onClick={() => handleNavigation("profile")}
          className={menu === "profile" ? "active" : ""}
          tabIndex="0" 
          style={{ cursor: "pointer" }}
          aria-label="profile"
          >
            Profile
          </li>
          <button
            onClick={handleLoginClick}
            className="login-btn"
            aria-label={user ? "Logout" : "Login or Sign up"}
          >
            {user ? "Logout" : "Login/Sign-up"}
          </button>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;

