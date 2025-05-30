import React, { useState, useEffect } from 'react';
import userService from '../services/user.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom'; // Optional: for linking to user profiles if implemented

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await userService.getLeaderboard();
        setLeaderboardData(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch leaderboard.';
        setError(errorMessage);
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h2>Leaderboard</h2>
      {leaderboardData.length === 0 ? (
        <p>The leaderboard is currently empty.</p>
      ) : (
        <table style={{ width: '80%', margin: '0 auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Rank</th>
              <th style={tableHeaderStyle}>Username</th>
              <th style={tableHeaderStyle}>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user, index) => (
              <tr key={user.user_id} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                <td style={tableCellStyle}>{index + 1}</td>
                <td style={tableCellStyle}>
                  {/* Optional: Link to a public user profile page if you implement that */}
                  {/* <Link to={`/users/${user.user_id}`}>{user.username}</Link> */}
                  {user.username}
                </td>
                <td style={tableCellStyle}>{user.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Basic styling for the table
const tableHeaderStyle = {
  borderBottom: '2px solid #ddd',
  padding: '12px',
  textAlign: 'left',
  backgroundColor: '#f2f2f2',
};

const tableCellStyle = {
  borderBottom: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
};

const evenRowStyle = {
  backgroundColor: '#f9f9f9',
};

const oddRowStyle = {
  backgroundColor: '#ffffff',
};


export default LeaderboardPage;
