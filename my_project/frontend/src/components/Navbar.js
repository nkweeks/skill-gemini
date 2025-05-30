import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout: authLogout, user } = useAuth(); // Renamed to avoid conflict with service
  const navigate = useNavigate();

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
      {isAuthenticated && (
        <>
          <Link to="/skills" style={{ marginRight: '10px' }}>Skills</Link>
          <Link to="/quizzes" style={{ marginRight: '10px' }}>Quizzes</Link>
          <Link to="/tasks" style={{ marginRight: '10px' }}>Tasks</Link>
          <Link to="/profile" style={{ marginRight: '10px' }}>Profile</Link>
          <Link to="/leaderboard" style={{ marginRight: '10px' }}>Leaderboard</Link>
        </>
      )}

      <div style={{ float: 'right' }}>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '10px' }}>
              {/* Display username if available, otherwise just "User" */}
              Hello, {user?.username || 'User'}
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
      <div style={{ clear: 'both' }}></div> {/* Clear float */}
    </nav>
  );
};

export default Navbar;
