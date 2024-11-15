import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";

export const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // check user true/false
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate("/login");
    }

    setIsAuthenticated(!!token);
    console.log("Token:", token); // Check if token is retrieved
  }, [localStorage.getItem("token")]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const token = response.data.data.token;

      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      setUser(jwtDecode(token));
      navigate("/");
    } catch (err) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("error in useAuth");
  }
  return context;
};

export default AuthProvider;
