import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token validation error:", error);
          sessionStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    // Initial check
    checkAuth();

    // React to same-tab auth changes
    const handleAuthChanged = () => checkAuth();
    window.addEventListener("auth-changed", handleAuthChanged);

    // React to cross-tab changes (sessionStorage events fire only on other tabs)
    const handleStorage = (e) => {
      if (e.key === "token") {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return { isAuthenticated, loading };
};
