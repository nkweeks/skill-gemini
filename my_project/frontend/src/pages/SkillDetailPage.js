import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import skillService from '../services/skill.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import QuizCard from '../components/QuizCard'; // Re-use QuizCard
import TaskCard from '../components/TaskCard'; // Re-use TaskCard

const SkillDetailPage = () => {
  const { skill_id } = useParams();
  const [skill, setSkill] = useState(null);
  const [relatedQuizzes, setRelatedQuizzes] = useState([]);
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkillDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const skillRes = await skillService.getSkillById(skill_id);
        setSkill(skillRes.data);

        // Fetch related quizzes
        try {
            const quizzesRes = await skillService.getQuizzesBySkillId(skill_id);
            setRelatedQuizzes(quizzesRes.data);
        } catch (quizzesError) {
            console.error(`Failed to fetch quizzes for skill ${skill_id}:`, quizzesError);
            // Set an error message specific to quizzes or handle gracefully
            setError(prev => prev + "\nCould not load quizzes for this skill.");
        }

        // Fetch related tasks
        try {
            const tasksRes = await skillService.getTasksBySkillId(skill_id);
            setRelatedTasks(tasksRes.data);
        } catch (tasksError) {
            console.error(`Failed to fetch tasks for skill ${skill_id}:`, tasksError);
            setError(prev => prev + "\nCould not load tasks for this skill.");
        }

      } catch (err) {
        setError(err.response?.data?.message || err.message || `Failed to fetch skill ${skill_id}.`);
        console.error(`Error fetching skill ${skill_id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillDetails();
  }, [skill_id]);

  if (loading && !skill) return <LoadingSpinner />; // Show spinner only if skill data is not yet loaded
  if (error && !skill) return <ErrorMessage message={error} />; // Show error if skill loading failed catastrophically
  if (!skill) return <p>Skill not found.</p>;


  return (
    <div>
      <h2>{skill.name}</h2>
      <p>{skill.description || 'No description available.'}</p>
      {error && <ErrorMessage message={error} />} {/* Display errors for related data if any */}

      <hr />
      <h3>Quizzes for this Skill</h3>
      {relatedQuizzes.length > 0 ? (
        relatedQuizzes.map(quiz => <QuizCard key={quiz.quiz_id} quiz={quiz} />)
      ) : (
        <p>No quizzes currently associated with this skill.</p>
      )}

      <hr />
      <h3>Tasks for this Skill</h3>
      {relatedTasks.length > 0 ? (
        relatedTasks.map(task => <TaskCard key={task.task_id} task={task} />)
      ) : (
        <p>No tasks currently associated with this skill.</p>
      )}
      <br />
      <Link to="/skills">Back to Skills</Link>
    </div>
  );
};

export default SkillDetailPage;
