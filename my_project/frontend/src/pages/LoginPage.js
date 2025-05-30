import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Renamed to avoid conflict

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!emailOrUsername || !password) {
      setError('Email/Username and password are required.');
      setLoading(false);
      return;
    }

    try {
      const data = await authService.login(emailOrUsername, password);
      if (data.token) {
        authLogin(data.token); // Call context login function
        navigate('/'); // Redirect to home page or dashboard
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error("Login error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="emailOrUsername">Email or Username:</label>
          <input
            type="text"
            id="emailOrUsername"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;
