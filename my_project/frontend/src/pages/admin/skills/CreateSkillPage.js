import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import skillService from '../../../services/skill.service';
import SkillForm from './SkillForm';

const CreateSkillPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateSkill = async (skillData) => {
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      await skillService.createSkill(skillData);
      setSuccessMessage('Skill created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/admin/skills');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create skill.');
      console.error("Create skill error:", err);
      setSubmitting(false);
    }
    // No need to setSubmitting(false) if navigating away on success
  };

  return (
    <div>
      <h2>Create New Skill</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <SkillForm
        onSubmit={handleCreateSkill}
        error={error}
        submitting={submitting}
      />
      <br />
      <Link to="/admin/skills">Back to Manage Skills</Link>
    </div>
  );
};

export default CreateSkillPage;
