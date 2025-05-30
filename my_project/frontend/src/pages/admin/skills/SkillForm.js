import React, { useState, useEffect } from 'react';

const SkillForm = ({ initialData = { name: '', description: '' }, onSubmit, isEditing = false, error, submitting }) => {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);

  useEffect(() => {
    setName(initialData.name);
    setDescription(initialData.description);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
        // Basic validation, can be expanded
        alert("Skill name cannot be empty.");
        return;
    }
    onSubmit({ name, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="skillName">Skill Name:</label>
        <input
          type="text"
          id="skillName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <label htmlFor="skillDescription">Description:</label>
        <textarea
          id="skillDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={submitting} style={{ padding: '10px 15px' }}>
        {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Skill' : 'Create Skill')}
      </button>
    </form>
  );
};

export default SkillForm;
