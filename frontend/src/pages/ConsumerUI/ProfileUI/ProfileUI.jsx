import React, { useEffect, useState } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faEnvelope, 
  faCamera, 
  faLock, 
  faTrashAlt,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import "./ProfileUI.css";
import defaultPic from "../../../assets/default-pic.png";

const ProfileUI = () => {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const auth = getAuth();
      await updatePassword(auth.currentUser, newPassword);
      setMessage("Password updated successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setPasswordError("Error updating password: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
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
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  if (message && !user)
    return (
      <div className="profile-container">
        <p className="profile-message error">{message}</p>
      </div>
  );
  if (!user)
    return (
      <div className="profile-container">
        <p className="profile-message">{message || "No user found."}</p>
      </div>
    );

  return (
    <div className="profile-container">
      {message && (
        <div className="success-notification">
          <FontAwesomeIcon icon={faCheckCircle} />
          {message}
        </div>
      )}

      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-image-wrapper">
          <img
            className="profile-img"
            src={selectedFile || user.profilePicUrl || defaultPic}
            alt="Profile"
          />
          <label htmlFor="upload-photo" className="upload-btn">
            <FontAwesomeIcon icon={faCamera} />
          </label>
          <input
            type="file"
            id="upload-photo"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <h2 className="profile-name">{user.display_name || user.name}</h2>
        <p className="profile-email">
          <FontAwesomeIcon icon={faEnvelope} className="email-icon" />
          {user.email}
        </p>

        <div className="profile-actions">
          <button className="btn primary" onClick={handleChangePassword}>
            <FontAwesomeIcon icon={faLock} />
            Change Password
          </button>
          <button className="btn danger" onClick={handleDeleteAccount}>
            <FontAwesomeIcon icon={faTrashAlt} />
            Delete Account
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="modal-header">
              <FontAwesomeIcon icon={faLock} className="modal-icon" />
              <h2>Change Password</h2>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              {passwordError && (
                <div className="error-message">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {passwordError}
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content danger-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="modal-header">
              <FontAwesomeIcon icon={faExclamationTriangle} className="modal-icon danger-icon" />
              <h2>Delete Account</h2>
            </div>
            <div className="modal-body">
              <p className="warning-text">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn danger" onClick={confirmDeleteAccount}>
                <FontAwesomeIcon icon={faTrashAlt} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileUI;

