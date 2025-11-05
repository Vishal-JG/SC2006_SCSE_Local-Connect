import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // <-- added userRole

  useEffect(() => {
    let refreshInterval;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const setToken = async () => {
          // Force fresh token with (true) parameter
          const token = await currentUser.getIdToken(true);
          localStorage.setItem("token", token);
        };

        await setToken(); // initial token save

        // Fetch user role from backend - FORCE FRESH DATA
        try {
          const token = await currentUser.getIdToken(true); // Force refresh
          const response = await axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success && response.data.user) {
            const role = response.data.user.role;
            console.log("✅ User role fetched:", role); // Debug log
            setUserRole(role);
            localStorage.setItem("role", role);
          } else {
            console.warn("⚠️ No role data received from backend");
            setUserRole(null);
            localStorage.removeItem("role");
          }
        } catch (err) {
          console.error("❌ Error fetching user role:", err);
          setUserRole(null);
          localStorage.removeItem("role");
        }

        // Refresh token every 30 minutes
        refreshInterval = setInterval(setToken, 30 * 60 * 1000);
      } else {
        // Clear everything when no user
        console.log("🔄 Clearing auth data - no user logged in");
        localStorage.clear(); // Clear ALL localStorage
        setUserRole(null);
        clearInterval(refreshInterval);
      }
    });

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const logout = async () => {
    console.log("🚪 Logging out - clearing all data");
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
    // Clear ALL localStorage data
    localStorage.clear();
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
