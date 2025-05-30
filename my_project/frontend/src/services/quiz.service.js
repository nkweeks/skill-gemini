import apiClient from './api';

const API_PATH = '/quizzes'; // Path for quizzes API

const getAllQuizzes = () => {
  return apiClient.get(API_PATH);
};

const getQuizById = (quizId) => {
  return apiClient.get(`${API_PATH}/${quizId}`);
};

// getQuizzesBySkillId is already in skill.service.js, which makes sense
// as it's usually called when viewing a skill.

const quizService = {
  getAllQuizzes,
  getQuizById,
  submitQuiz,
};

export default quizService;
