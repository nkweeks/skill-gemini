import apiClient from './api';

const API_PATH = '/users'; // Base path for user-related APIs

const getLoggedInUserProfile = () => {
  return apiClient.get(`${API_PATH}/me`); // Endpoint should be /api/users/me
};

const getMyEarnedBadges = () => {
  return apiClient.get(`${API_PATH}/me/badges`); // Endpoint should be /api/users/me/badges
};

// Example: Get public profile (if you have such an endpoint)
// const getUserProfile = (userId) => {
//   return apiClient.get(`${API_PATH}/${userId}`);
// };

const userService = {
  getLoggedInUserProfile,
  getMyEarnedBadges,
  // getUserProfile,
  getLeaderboard,
};

export default userService;
