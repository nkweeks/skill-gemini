import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import taskService from '../services/task.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../contexts/AuthContext'; // To get current user ID

const TaskDetailPage = () => {
  const { task_id } = useParams();
  const { user: authUser } = useAuth(); // Get authenticated user info

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionError, setSubmissionError] = useState('');

  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const taskRes = await taskService.getTaskById(task_id);
        setTask(taskRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || `Failed to fetch task ${task_id}.`);
        console.error(`Error fetching task ${task_id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
        if (!authUser) return; // Don't fetch if user not loaded
        try {
            setLoadingSubmissions(true);
            const submissionsRes = await taskService.getTaskSubmissionsForTask(task_id);
            // Filter submissions to show only those by the current user for this task page
            const currentUserSubmissions = submissionsRes.data.filter(sub => sub.user_id === authUser.user_id);
            setUserSubmissions(currentUserSubmissions);
        } catch (err) {
            console.error('Error fetching submissions for task:', err);
            // Optionally set an error state for submissions
        } finally {
            setLoadingSubmissions(false);
        }
    };

    fetchTaskDetails();
    if (authUser?.user_id) { // Ensure authUser and its ID is available
        fetchSubmissions();
    }
  }, [task_id, authUser]);

  const handleSubmissionChange = (e) => {
    setSubmissionContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage('');
    setSubmissionError('');

    if (!submissionContent.trim()) {
      setSubmissionError('Submission content cannot be empty.');
      setIsSubmitting(false);
      return;
    }

    try {
      await taskService.submitTask(task_id, { submission_content: submissionContent });
      setSubmissionMessage('Task submitted successfully!');
      setSubmissionContent(''); // Clear textarea
      // Refresh submissions list
      if (authUser?.user_id) {
        setLoadingSubmissions(true);
        const submissionsRes = await taskService.getTaskSubmissionsForTask(task_id);
        const currentUserSubmissions = submissionsRes.data.filter(sub => sub.user_id === authUser.user_id);
        setUserSubmissions(currentUserSubmissions);
        setLoadingSubmissions(false);
      }
    } catch (err) {
      setSubmissionError(err.response?.data?.message || err.message || 'Failed to submit task.');
      console.error("Task submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !task) return <LoadingSpinner />;
  if (error && !task) return <ErrorMessage message={error} />;
  if (!task) return <p>Task not found.</p>;

  return (
    <div>
      <h2>{task.title}</h2>
      <p>{task.description || 'No description available.'}</p>
      <p><strong>Points:</strong> {task.points_value}</p>
      {task.Skill && <p><strong>Skill:</strong> {task.Skill.name}</p>}
      {task.Creator && <p><strong>Created by:</strong> {task.Creator.username}</p>}

      <hr />
      <h3>Submit Your Work</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            value={submissionContent}
            onChange={handleSubmissionChange}
            rows="10"
            placeholder="Enter your submission here..."
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required
          />
        </div>
        {submissionError && <p style={{ color: 'red' }}>{submissionError}</p>}
        {submissionMessage && <p style={{ color: 'green' }}>{submissionMessage}</p>}
        <button type="submit" disabled={isSubmitting} style={{ marginTop: '10px', padding: '10px 15px' }}>
          {isSubmitting ? 'Submitting...' : 'Submit Task'}
        </button>
      </form>

      <hr />
      <h3>Your Previous Submissions for this Task:</h3>
      {loadingSubmissions ? <LoadingSpinner /> : (
        userSubmissions.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {userSubmissions.map(sub => (
              <li key={sub.submission_id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <p><strong>Submitted on:</strong> {new Date(sub.submitted_at).toLocaleString()}</p>
                <p><strong>Status:</strong> {sub.status}</p>
                {sub.status === 'completed' && sub.points_awarded !== null && (
                  <p><strong>Points Awarded:</strong> {sub.points_awarded}</p>
                )}
                <p><strong>Content:</strong></p>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                  {sub.submission_content}
                </pre>
                 {sub.graded_at && <p><small>Graded on: {new Date(sub.graded_at).toLocaleString()}</small></p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not made any submissions for this task yet.</p>
        )
      )}

      <br />
      <Link to="/tasks">Back to Tasks</Link>
    </div>
  );
};

export default TaskDetailPage;
