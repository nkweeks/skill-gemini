import React from 'react';
import { Link } from 'react-router-dom';

const QuizCard = ({ quiz }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '8px', borderRadius: '4px' }}>
      <h3>
        <Link to={`/quizzes/${quiz.quiz_id}`}>{quiz.title}</Link>
      </h3>
      <p>{quiz.description || 'No description available.'}</p>
      {quiz.Skill && <p><small>Skill: {quiz.Skill.name}</small></p>}
      {quiz.Creator && <p><small>Created by: {quiz.Creator.username}</small></p>}
    </div>
  );
};

export default QuizCard;
