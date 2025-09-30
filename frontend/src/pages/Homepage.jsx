import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';


export default function Home({ user }) {

const handleLogout = async () => {
  try {
    const idToken = await auth.currentUser.getIdToken();  // Get token BEFORE signOut

    await axios.post('http://localhost:5000/api/logout', {}, {
      headers: { Authorization: `Bearer ${idToken}` }
    });

    await signOut(auth);  // Call signOut AFTER notifying backend
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
