import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import quizService from '../services/quiz.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../contexts/AuthContext'; // To potentially update user points/badges after submission

const QuizAttemptPage = () => {
  const { quiz_id } = useParams();
  const navigate = useNavigate();
  const { user, login: authLogin } = useAuth(); // Assuming login might refresh user data including points

  const [quiz, setQuiz] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState({}); // { question_id: choice_id or answer_text }
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    quizService.getQuizById(quiz_id)
      .then(response => {
        setQuiz(response.data);
        // Initialize answers state
        const initialAnswers = {};
        if (response.data.Questions) {
          response.data.Questions.forEach(q => {
            initialAnswers[q.question_id] = q.question_type === 'true-false' ? '' : (q.question_type === 'multiple-choice' ? '' : '');
          });
        }
        setCurrentAnswers(initialAnswers);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || `Failed to fetch quiz ${quiz_id}.`);
        setLoading(false);
      });
  }, [quiz_id]);

  const handleAnswerChange = (questionId, value) => {
    setCurrentAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formattedAnswers = quiz.Questions.map(q => {
      const answerValue = currentAnswers[q.question_id];
      const answer = { question_id: q.question_id };
      if (q.question_type === 'multiple-choice' || q.question_type === 'true-false') {
        if (answerValue) { // Ensure a choice was made
             answer.choice_id = parseInt(answerValue, 10);
        } else {
            // Handle unanswered auto-gradable questions if necessary,
            // backend might penalize or ignore. For now, send null/undefined if not answered.
             answer.choice_id = null;
        }
      } else if (q.question_type === 'short-answer') {
        answer.answer_text = answerValue;
      }
      return answer;
    });

    // Filter out answers where choice_id is null for auto-gradable if backend expects only answered questions
    // const finalAnswers = formattedAnswers.filter(ans => !( (quiz.Questions.find(q=>q.question_id === ans.question_id)?.question_type === 'multiple-choice' || quiz.Questions.find(q=>q.question_id === ans.question_id)?.question_type === 'true-false') && ans.choice_id === null) );


    try {
      const result = await quizService.submitQuiz(quiz_id, formattedAnswers);
      setSubmissionResult(result.data);
      // Potentially refresh user data in AuthContext if points/badges were awarded
      // This might involve fetching the latest token if it's refreshed with new claims,
      // or simply refetching user profile data.
      // For now, we assume the backend updates points and the next ProfilePage load will show it.
      // Or, if the submission response includes an updated token:
      // if (result.data.updatedToken) { authLogin(result.data.updatedToken); }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit quiz.');
      console.error("Quiz submission error:", err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !quiz) return <LoadingSpinner />;
  if (error && !quiz && !submissionResult) return <ErrorMessage message={error} />; // Show error only if quiz loading failed
  if (!quiz) return <p>Quiz not found.</p>;

  if (submissionResult) {
    return (
      <div>
        <h2>Quiz Results - {quiz.title}</h2>
        <p>Your Score: {submissionResult.score !== null ? `${submissionResult.score.toFixed(2)}%` : 'Not scored'}</p>
        <h3>Your Answers:</h3>
        <ul>
          {submissionResult.submitted_answers?.map(ans => {
            const question = quiz.Questions.find(q => q.question_id === ans.question_id);
            let choiceText = ans.answer_text || '';
            if (ans.choice_id && question) {
                const choice = question.Choices.find(c => c.choice_id === ans.choice_id);
                if (choice) choiceText = choice.choice_text;
            }
            return (
              <li key={ans.question_id} style={{
                  color: ans.is_correct === true ? 'green' : (ans.is_correct === false ? 'red' : 'black'),
                  marginBottom: '10px',
                  padding: '5px',
                  border: '1px solid #eee'
                }}>
                <strong>{question?.question_text}</strong>
                <p>Your answer: {choiceText || "No answer / Not applicable"}</p>
                {ans.is_correct !== null && (
                    <p>{ans.is_correct ? "Correct!" : "Incorrect."}</p>
                )}
                {ans.is_correct === null && question?.question_type === 'short-answer' && (
                    <p>(Short answer awaiting manual grading)</p>
                )}
              </li>
            );
          })}
        </ul>
        <Link to={`/quizzes/${quiz_id}`}>Back to Quiz Details</Link> | <Link to="/quizzes">Back to Quizzes List</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Attempt Quiz: {quiz.title}</h2>
      <p>{quiz.description}</p>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        {quiz.Questions?.map(q => (
          <div key={q.question_id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #f0f0f0' }}>
            <h4>{q.question_text}</h4>
            {q.question_type === 'multiple-choice' && q.Choices?.map(choice => (
              <div key={choice.choice_id}>
                <input
                  type="radio"
                  id={`q${q.question_id}_c${choice.choice_id}`}
                  name={`q_${q.question_id}`}
                  value={choice.choice_id}
                  onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                  checked={currentAnswers[q.question_id] === String(choice.choice_id)}
                />
                <label htmlFor={`q${q.question_id}_c${choice.choice_id}`}>{choice.choice_text}</label>
              </div>
            ))}
            {q.question_type === 'true-false' && q.Choices?.map(choice => (
                 <div key={choice.choice_id}>
                 <input
                   type="radio"
                   id={`q${q.question_id}_c${choice.choice_id}`}
                   name={`q_${q.question_id}`}
                   value={choice.choice_id} // Assuming choice_id represents true/false selection
                   onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                   checked={currentAnswers[q.question_id] === String(choice.choice_id)}
                 />
                 <label htmlFor={`q${q.question_id}_c${choice.choice_id}`}>{choice.choice_text}</label>
               </div>
            ))}
            {q.question_type === 'short-answer' && (
              <textarea
                value={currentAnswers[q.question_id] || ''}
                onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                rows="3"
                style={{ width: '90%', padding: '5px' }}
              />
            )}
          </div>
        ))}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      </form>
    </div>
  );
};

export default QuizAttemptPage;
