import React, { useState, useEffect } from 'react';
import userService from '../services/user.service';
import taskService from '../services/task.service'; // Import taskService
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // For linking to tasks

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [taskSubmissions, setTaskSubmissions] = useState([]); // State for task submissions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const profileRes = await userService.getLoggedInUserProfile();
        setProfile(profileRes.data);

        const badgesRes = await userService.getMyEarnedBadges();
        setBadges(badgesRes.data);

        const submissionsRes = await taskService.getTaskSubmissionsForUser(); // Fetch task submissions
        setTaskSubmissions(submissionsRes.data);

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile data.';
        setError(errorMessage);
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (authUser?.user_id) { // Ensure user is available before fetching
        fetchData();
    } else {
        // Handle case where authUser is not yet available (e.g. still loading context)
        // This might require a slight delay or listening to auth context changes more directly
        setLoading(false);
        setError("User not authenticated or session loading.");
    }
  }, [authUser]);

  if (loading) return <LoadingSpinner />;
  // Keep error display for general data loading errors
  if (error && !profile) return <ErrorMessage message={error} />;
  if (!profile) return <p>Could not load profile. Ensure you are logged in.</p>;


  const username = profile.username || authUser?.username;

  return (
    <div>
      <h2>My Profile</h2>
      {error && <ErrorMessage message={error} /> /* Show specific errors if parts failed but profile loaded */}
      <p><strong>Username:</strong> {username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Total Points:</strong> {profile.total_points}</p>

      <h3>My Badges:</h3>
      {badges.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {badges.map(badge => (
            <li key={badge.badge_id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
              {badge.icon_url &&
                <img src={badge.icon_url} alt={badge.name} style={{ width: '50px', height: '50px', marginRight: '15px', border: '1px solid #ddd' }} />
              }
              <div>
                <strong>{badge.name}</strong>
                <p>{badge.description}</p>
                {badge.UserBadge && <small>Earned on: {new Date(badge.UserBadge.earned_at).toLocaleDateString()}</small>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No badges earned yet.</p>
      )}

      <hr />
      <h3>My Task Submissions:</h3>
      {taskSubmissions.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {taskSubmissions.map(sub => (
            <li key={sub.submission_id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
              {sub.Task ? (
                <h4><Link to={`/tasks/${sub.task_id}`}>{sub.Task.title}</Link></h4>
              ) : (
                <h4>Task ID: {sub.task_id} (Details unavailable)</h4>
              )}
              <p><strong>Status:</strong> {sub.status}</p>
              {sub.points_awarded !== null && <p><strong>Points Awarded:</strong> {sub.points_awarded}</p>}
              <p><small>Submitted on: {new Date(sub.submitted_at).toLocaleString()}</small></p>
              {sub.graded_at && <p><small>Graded on: {new Date(sub.graded_at).toLocaleString()}</small></p>}
              <details>
                <summary>View Submission Content</summary>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '10px', borderRadius: '4px', marginTop: '5px' }}>
                  {sub.submission_content}
                </pre>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not submitted any tasks yet.</p>
      )}
    </div>
  );
};

export default ProfilePage;
