import apiClient from './api';

const API_PATH = '/tasks'; // Path for tasks API

const getAllTasks = () => {
  return apiClient.get(API_PATH);
};

const getTaskById = (taskId) => {
  return apiClient.get(`${API_PATH}/${taskId}`);
};

// getTasksBySkillId is already in skill.service.js

const submitTask = (taskId, submissionData) => {
  // submissionData should be an object like { submission_content: "User's text" }
  return apiClient.post(`/task-submissions/task/${taskId}/submit`, submissionData);
};

const getTaskSubmissionsForUser = () => {
  // Fetches all submissions for the currently logged-in user
  return apiClient.get('/task-submissions/user/me');
};

const getTaskSubmissionsForTask = (taskId) => {
  // Fetches all submissions for a specific task.
  // Authorization on the backend determines who can see these.
  // The current frontend implementation will display them if fetched.
  return apiClient.get(`/task-submissions/task/${taskId}`);
};


const taskService = {
  getAllTasks,
  getTaskById,
  submitTask,
  getTaskSubmissionsForUser,
  getTaskSubmissionsForTask,
};

export default taskService;
