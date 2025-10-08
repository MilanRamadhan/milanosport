import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: boolean; // true for admin, false for regular user
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  // Session expiry: 24 jam (dalam milidetik)
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 jam

  useEffect(() => {
    // Check for stored authentication data on app load
    const storedToken = sessionStorage.getItem("authToken");
    const storedUser = sessionStorage.getItem("userData");
    const loginTimestamp = sessionStorage.getItem("loginTimestamp");

    if (storedToken && storedUser && loginTimestamp) {
      try {
        const userData = JSON.parse(storedUser);
        const loginTime = parseInt(loginTimestamp);
        const currentTime = new Date().getTime();
        const timeElapsed = currentTime - loginTime;

        // Cek apakah session sudah expired (lebih dari 24 jam)
        if (timeElapsed > SESSION_DURATION) {
          // Session expired, clear data
          console.log("Session expired, please login again");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userData");
          sessionStorage.removeItem("loginTimestamp");
          localStorage.removeItem("redirectAfterLogin");
        } else {
          // Session masih valid, restore user data
          setToken(storedToken);
          setUser(userData);
        }
      } catch (error) {
        // Clear invalid stored data
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("loginTimestamp");
      }
    }

    // Set loading to false after checking
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    const loginTime = new Date().getTime();

    setToken(newToken);
    setUser(userData);
    sessionStorage.setItem("authToken", newToken);
    sessionStorage.setItem("userData", JSON.stringify(userData));
    sessionStorage.setItem("loginTimestamp", loginTime.toString());
  };

  const logout = async () => {
    try {
      if (user) {
        await authApi.logout(user.id);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setToken(null);
      setUser(null);
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      sessionStorage.removeItem("loginTimestamp");
      localStorage.removeItem("redirectAfterLogin");
      // Navigation will be handled by the component that calls logout
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === true,
    isLoading, // Add loading to context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
