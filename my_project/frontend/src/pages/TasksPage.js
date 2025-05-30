import React, { useState, useEffect } from 'react';
import taskService from '../services/task.service';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    taskService.getAllTasks()
      .then(response => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch tasks.');
        setLoading(false);
        console.error("Error fetching tasks:", err);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h2>Tasks</h2>
      {tasks.length === 0 && !loading && <p>No tasks available.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {tasks.map(task => (
          <TaskCard key={task.task_id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
