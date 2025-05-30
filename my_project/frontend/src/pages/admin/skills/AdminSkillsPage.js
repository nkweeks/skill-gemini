import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import skillService from '../../../services/skill.service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';

const AdminSkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(''); // For delete success/error

  const fetchSkills = () => {
    setLoading(true);
    skillService.getAllSkills()
      .then(response => {
        setSkills(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch skills.');
        setLoading(false);
        console.error("Error fetching skills:", err);
      });
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleDeleteSkill = async (skillId, skillName) => {
    if (window.confirm(`Are you sure you want to delete the skill "${skillName}"? This action cannot be undone.`)) {
      setActionMessage(''); // Clear previous messages
      try {
        await skillService.deleteSkill(skillId);
        setActionMessage(`Skill "${skillName}" deleted successfully.`);
        fetchSkills(); // Refresh the list
      } catch (err) {
        const delError = err.response?.data?.message || err.message || `Failed to delete skill "${skillName}".`;
        setActionMessage(delError);
        console.error("Delete skill error:", err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h2>Manage Skills</h2>
      <Link to="/admin/skills/new" style={{ marginBottom: '20px', display: 'inline-block', padding: '10px 15px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        Create New Skill
      </Link>
      {actionMessage && <p style={{ color: actionMessage.includes('successfully') ? 'green' : 'red' }}>{actionMessage}</p>}
      {skills.length === 0 ? (
        <p>No skills found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => (
              <tr key={skill.skill_id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{skill.skill_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{skill.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {skill.description || '-'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <Link to={`/admin/skills/${skill.skill_id}/edit`} style={{ marginRight: '10px' }}>Edit</Link>
                  <button onClick={() => handleDeleteSkill(skill.skill_id, skill.name)} style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminSkillsPage;
