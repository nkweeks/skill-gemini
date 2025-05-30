import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Optional: store decoded user info
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      // Optionally decode token to get user info and set it
      // For example:
      // const decodedUser = jwtDecode(storedToken); // Assuming you use jwt-decode
      // setUser(decodedUser);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    // Optionally decode token:
    // const decodedUser = jwtDecode(newToken);
    // setUser(decodedUser);
    console.log("Logged in, token set:", newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log("Logged out");
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
