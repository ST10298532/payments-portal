import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  const login = (token, csrf) => {
    setAccessToken(token);
    setCsrfToken(csrf);
  };

  const logout = () => {
    setAccessToken(null);
    setCsrfToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, csrfToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
