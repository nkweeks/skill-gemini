import React from 'react';
import { Link } from 'react-router-dom';

const SkillCard = ({ skill }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '8px', borderRadius: '4px' }}>
      <h3>
        <Link to={`/skills/${skill.skill_id}`}>{skill.name}</Link>
      </h3>
      <p>{skill.description || 'No description available.'}</p>
    </div>
  );
};

export default SkillCard;
