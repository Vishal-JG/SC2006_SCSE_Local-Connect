import React, { useEffect, useState } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import "./ProfileUI.css";
import defaultPic from "../../../assets/default-pic.png";

const ProfileUI = () => {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setMessage("You must be logged in to view your profile.");
          setLoading(false);
          return;
        }
        const token = await currentUser.getIdToken();
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load user profile");
        const data = await res.json();
        
        // Merge backend data with Firebase displayName as fallback
        const userProfile = {
          ...data.user,
          display_name: data.user.display_name || currentUser.displayName || 'User'
        };
        setUser(userProfile);
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(URL.createObjectURL(file));
      // TODO: Upload file to backend here
    }
  };

  const handleChangePassword = async () => {
    const auth = getAuth();
    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return;
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("Password updated successfully!");
    } catch (err) {
      alert("Error updating password: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/users/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete account");
      alert("Account deleted successfully!");
      await auth.signOut();
      window.location.href = "/";
    } catch (err) {
      alert("Error deleting account: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="profile-container">
        <p>Loading...</p>
      </div>
    );
  if (message)
    return (
      <div className="profile-container">
        <p className="profile-message">{message}</p>
      </div>
  );
  if (!user)
    return (
      <div className="profile-container">
        <p>{message || "No user found."}</p>
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-image-wrapper">
          <img
            className="profile-img"
            src={selectedFile || user.profilePicUrl || defaultPic}
            alt="Profile"
          />
          <label htmlFor="upload-photo" className="upload-btn">
            Upload Photo
          </label>
          <input
            type="file"
            id="upload-photo"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <h3 className="profile-name">{user.display_name || user.name}</h3>
        <p className="profile-email">{user.email}</p>

        <div className="profile-actions">
          <button className="btn primary" onClick={handleChangePassword}>
            Change Password
          </button>
          <button className="btn danger" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileUI;

