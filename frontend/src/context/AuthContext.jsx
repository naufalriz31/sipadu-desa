import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sipadu_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (token, userData) => {
    localStorage.setItem("sipadu_token", token);
    localStorage.setItem("sipadu_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
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
