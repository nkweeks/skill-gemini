import apiClient from './api';

const API_PATH = '/skills'; // Path for skills API

const getAllSkills = () => {
  return apiClient.get(API_PATH);
};

const getSkillById = (skillId) => {
  return apiClient.get(`${API_PATH}/${skillId}`);
};

// For SkillDetailPage, to get quizzes and tasks related to a skill
const getQuizzesBySkillId = (skillId) => {
  return apiClient.get(`/quizzes/skill/${skillId}`); // Assuming this path is relative to API_BASE_URL
};

const getTasksBySkillId = (skillId) => {
  return apiClient.get(`/tasks/skill/${skillId}`); // Assuming this path is relative to API_BASE_URL
};


const skillService = {
  getAllSkills,
  getSkillById,
  getQuizzesBySkillId,
  getTasksBySkillId,
  createSkill,
  updateSkill,
  deleteSkill,
};

const createSkill = (skillData) => {
  // skillData should be an object like { name: "New Skill", description: "..." }
  return apiClient.post(API_PATH, skillData);
};

const updateSkill = (skillId, skillData) => {
  return apiClient.put(`${API_PATH}/${skillId}`, skillData);
};

const deleteSkill = (skillId) => {
  return apiClient.delete(`${API_PATH}/${skillId}`);
};

const skillService = {
  getAllSkills,
  getSkillById,
  getQuizzesBySkillId,
  getTasksBySkillId,
  createSkill,
  updateSkill,
  deleteSkill,
};

export default skillService;
