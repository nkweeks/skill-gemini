import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user, logout: authLogout } = useAuth(); // Renamed to avoid conflict
  const navigate = useNavigate();

  const handleLogout = () => {
    authLogout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div>
      <h1>Welcome to the Application!</h1>
      {/*
        The user object might be null if not decoded from token in AuthContext.
        If user details (like name) are needed, ensure AuthContext provides them.
        For now, we just confirm authentication.
      */}
      {user ? (
        <p>Hello, {user.username || 'User'}!</p> // Assuming user object has username
      ) : (
        <p>You are logged in.</p>
      )}
      <button onClick={handleLogout}>Logout</button>
      {/* Add more content for the home page here */}
    </div>
  );
};

export default HomePage;
