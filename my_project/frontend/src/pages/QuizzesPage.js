import React, { useState, useEffect } from 'react';
import quizService from '../services/quiz.service';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    quizService.getAllQuizzes()
      .then(response => {
        setQuizzes(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch quizzes.');
        setLoading(false);
        console.error("Error fetching quizzes:", err);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h2>Quizzes</h2>
      {quizzes.length === 0 && !loading && <p>No quizzes available.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {quizzes.map(quiz => (
          <QuizCard key={quiz.quiz_id} quiz={quiz} />
        ))}
      </div>
    </div>
  );
};

export default QuizzesPage;
