import React from 'react';

const ErrorMessage = ({ message }) => (
  <div style={{ color: 'red', padding: '10px', border: '1px solid red', margin: '10px 0' }}>
    <p>Error: {message || 'An unexpected error occurred.'}</p>
  </div>
);

export default ErrorMessage;
