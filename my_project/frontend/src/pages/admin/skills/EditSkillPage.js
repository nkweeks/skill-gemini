import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import skillService from '../../../services/skill.service';
import SkillForm from './SkillForm';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';

const EditSkillPage = () => {
  const { skill_id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    setLoading(true);
    skillService.getSkillById(skill_id)
      .then(response => {
        setSkill(response.data);
        setLoading(false);
      })
      .catch(err => {
        setPageError(err.response?.data?.message || err.message || `Failed to fetch skill ${skill_id}.`);
        console.error(`Error fetching skill ${skill_id}:`, err);
        setLoading(false);
      });
  }, [skill_id]);

  const handleUpdateSkill = async (skillData) => {
    setSubmitting(true);
    setFormError('');
    setSuccessMessage('');
    try {
      await skillService.updateSkill(skill_id, skillData);
      setSuccessMessage('Skill updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/admin/skills');
      }, 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update skill.');
      console.error("Update skill error:", err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (pageError) return <ErrorMessage message={pageError} />;
  if (!skill) return <p>Skill data not found.</p>;

  return (
    <div>
      <h2>Edit Skill: {skill.name}</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <SkillForm
        initialData={skill}
        onSubmit={handleUpdateSkill}
        isEditing={true}
        error={formError}
        submitting={submitting}
      />
      <br />
      <Link to="/admin/skills">Back to Manage Skills</Link>
    </div>
  );
};

export default EditSkillPage;
