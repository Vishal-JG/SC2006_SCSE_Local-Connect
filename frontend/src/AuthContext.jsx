import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [initializing, setInitializing] = useState(true); // prevent route races

  useEffect(() => {
    let refreshInterval;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const setToken = async () => {
          const token = await currentUser.getIdToken(true); // force fresh
          localStorage.setItem("token", token);
        };

        await setToken(); // initial token save

        // Fetch user role from backend
        try {
          const token = await currentUser.getIdToken(true);
          
          // ALWAYS prime the backend session first on auth state change
          try {
            await axios.post(
              "http://localhost:5000/api/login",
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (primeErr) {
            console.warn("⚠️ Backend priming failed (may be okay):", primeErr.message);
          }
          
          // Now fetch the profile
          const response = await axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const role = response.data.user?.role || null;
          setUserRole(role);
          localStorage.setItem("role", role || "");
          console.log("✅ User role fetched:", role);
        } catch (err) {
          console.error("❌ Error fetching user role:", err);
          setUserRole(null);
          localStorage.removeItem("role");
        } finally {
          setInitializing(false);
        }

        // Refresh token every 30 minutes
        refreshInterval = setInterval(setToken, 30 * 60 * 1000);
      } else {
        // No user
        console.log("🔄 Clearing auth data - no user logged in");
        localStorage.clear();
        setUserRole(null);
        clearInterval(refreshInterval);
        setInitializing(false);
      }
    });

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.clear();
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, initializing, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
