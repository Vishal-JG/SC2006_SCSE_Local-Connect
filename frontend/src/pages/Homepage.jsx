import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Home({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // After sign-out, the onAuthStateChanged in App.jsx will detect and update UI
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      <h1>Welcome, {user.displayName || user.email}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
