import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("cm360_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("cm360_token");
  });

  const login = (userData, authToken) => {
    localStorage.setItem("cm360_user", JSON.stringify(userData));
    localStorage.setItem("cm360_token", authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem("cm360_user");
    localStorage.removeItem("cm360_token");
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}