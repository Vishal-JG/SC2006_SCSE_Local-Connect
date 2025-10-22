import React, { useEffect, useState } from 'react';
import { getAuth, updatePassword } from 'firebase/auth';
import './ProfileUI.css';
import pic from '../../../assets/default-pic.png';

const ProfileUI = () => {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setMessage('You must be logged in to view your profile.');
          setLoading(false);
          return;
        }
        
        const token = await currentUser.getIdToken();

        const res = await fetch('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load user profile');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle profile picture upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(URL.createObjectURL(file));

      // Later: send to backend using FormData
      // const formData = new FormData();
      // formData.append('profile_image', file);
      // fetch('/api/users/upload-photo', { method: 'POST', body: formData });
    }
  };

  // Change password (Firebase side)
  const handleChangePassword = async () => {
    const auth = getAuth();
    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;

    try {
      await updatePassword(auth.currentUser, newPassword);
      alert('Password updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating password: ' + err.message);
    }
  };

  // Delete account (Firebase + backend)
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch('http://localhost:5000/api/users/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete account');
      alert('Account deleted successfully!');
      await auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('Error deleting account: ' + err.message);
    }
  };

  if (loading) return <div className="profile-container">Loading...</div>;
  if (!user)
    return <div className="profile-container">{message || 'No user found.'}</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          className="profile-img"
          src={selectedFile || user.profilePicUrl || pic}
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
          style={{ display: 'none' }}
        />

        <h3>{user.display_name || user.name}</h3>
        <p>{user.email}</p>

        <button className="profile-btn" onClick={handleChangePassword}>
          Change Password
        </button>
        <button className="profile-btn delete" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default ProfileUI;
