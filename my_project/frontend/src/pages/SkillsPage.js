import React, { useState, useEffect } from 'react';
import skillService from '../services/skill.service';
import SkillCard from '../components/SkillCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h2>Skills</h2>
      {skills.length === 0 && !loading && <p>No skills available.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {skills.map(skill => (
          <SkillCard key={skill.skill_id} skill={skill} />
        ))}
      </div>
    </div>
  );
};

export default SkillsPage;
