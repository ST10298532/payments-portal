import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [role, setRole] = useState(null);

  const login = (token, userRole) => {
    setAccessToken(token);
    setRole(userRole);
  };

  const logout = () => {
    setAccessToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
