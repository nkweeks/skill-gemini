import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import quizService from '../services/quiz.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const QuizDetailPage = () => {
  const { quiz_id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    quizService.getQuizById(quiz_id)
      .then(response => {
        setQuiz(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || `Failed to fetch quiz ${quiz_id}.`);
        setLoading(false);
        console.error(`Error fetching quiz ${quiz_id}:`, err);
      });
  }, [quiz_id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!quiz) return <p>Quiz not found.</p>;

  return (
    <div>
      <h2>{quiz.title}</h2>
      <p>{quiz.description || 'No description available.'}</p>
      {quiz.Skill && <p><strong>Skill:</strong> {quiz.Skill.name}</p>}
      {quiz.Creator && <p><strong>Created by:</strong> {quiz.Creator.username}</p>}

      <h3>Questions:</h3>
      {quiz.Questions && quiz.Questions.length > 0 ? (
        <ul>
          {quiz.Questions.map(question => (
            <li key={question.question_id}>
              <p><strong>{question.question_text}</strong> ({question.question_type})</p>
              {question.Choices && question.Choices.length > 0 && (
                <ul>
                  {question.Choices.map(choice => (
                    <li key={choice.choice_id}>
                      {choice.choice_text} {choice.is_correct ? '(Correct)' : ''}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No questions available for this quiz yet.</p>
      )}

      <Link to={`/quizzes/${quiz.quiz_id}/attempt`}>
        <button style={{ marginTop: '20px', padding: '10px 15px', fontSize: '16px' }}>
          Start Quiz
        </button>
      </Link>
      <br /><br />
      <Link to="/quizzes">Back to Quizzes List</Link>
    </div>
  );
};

export default QuizDetailPage;
