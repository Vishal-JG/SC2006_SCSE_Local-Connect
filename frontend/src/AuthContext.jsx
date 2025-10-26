import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let refreshInterval;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const setToken = async () => {
          const token = await currentUser.getIdToken(true);
          localStorage.setItem("token", token);
        };

        await setToken(); // initial token save

        // Refresh token every 30 minutes
        refreshInterval = setInterval(setToken, 30 * 60 * 1000);
      } else {
        localStorage.removeItem("token");
        clearInterval(refreshInterval);
      }
    });

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Get and store the Firebase ID token
        const token = await currentUser.getIdToken(true);
        localStorage.setItem("token", token);
        console.log("Token saved to localStorage");
      } else {
        // Clear the token if user logs out
        localStorage.removeItem("token");
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("token"); // ensure token cleared
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
