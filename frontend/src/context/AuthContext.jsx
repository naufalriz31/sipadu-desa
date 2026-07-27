import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("sipadu_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (token, userData) => {
    sessionStorage.setItem("sipadu_token", token);
    sessionStorage.setItem("sipadu_user", JSON.stringify(userData));
    // Clean old persistent storage if any
    localStorage.removeItem("sipadu_token");
    localStorage.removeItem("sipadu_user");
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("sipadu_token");
    sessionStorage.removeItem("sipadu_user");
    localStorage.removeItem("sipadu_token");
    localStorage.removeItem("sipadu_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
