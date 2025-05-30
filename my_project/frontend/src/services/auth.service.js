import apiClient from './api'; // Use the centralized apiClient

const API_PATH = '/auth'; // Specific path for auth relative to API_BASE_URL

const register = (username, email, password) => {
  return apiClient.post(`${API_PATH}/register`, {
    username,
    email,
    password,
  });
};

const login = (emailOrUsername, password) => {
  const isEmail = emailOrUsername.includes('@');
  const payload = { password };
  if (isEmail) {
    payload.email = emailOrUsername;
  } else {
    payload.username = emailOrUsername;
  }

  return apiClient.post(`${API_PATH}/login`, payload)
    .then(response => {
      // Token is already handled by AuthContext after successful login in component
      // The interceptor in api.js will store the token if login is successful
      // and response contains a token. However, login in AuthContext handles localStorage explicitly.
      if (response.data.token) {
        console.log("Login successful, token received from backend via apiClient.");
      }
      return response.data;
    });
};

const logout = () => {
  // Client-side token removal is handled by AuthContext.
  // If backend had a session invalidation endpoint, call it here via apiClient.
  console.log("Logout service call (typically client-side token removal).");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
