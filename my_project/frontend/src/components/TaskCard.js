import React from 'react';
import { Link } from 'react-router-dom';

const TaskCard = ({ task }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '8px', borderRadius: '4px' }}>
      <h3>
        <Link to={`/tasks/${task.task_id}`}>{task.title}</Link>
      </h3>
      <p>{task.description || 'No description available.'}</p>
      <p>Points: {task.points_value}</p>
      {task.Skill && <p><small>Skill: {task.Skill.name}</small></p>}
      {task.Creator && <p><small>Created by: {task.Creator.username}</small></p>}
    </div>
  );
};

export default TaskCard;
