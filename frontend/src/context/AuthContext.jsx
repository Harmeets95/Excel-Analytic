import { createContext, useState, useEffect } from "react";
import { setAuthToken } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token") || null;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const login = (newToken) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setAuthToken(newToken);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      setToken(null);
      setAuthToken(null);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
