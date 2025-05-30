import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // For potential future admin checks

const AdminLayout = () => {
  const { isAuthenticated } = useAuth(); // Later, check for admin role here

  // Basic check, real admin protection would be more robust
  if (!isAuthenticated) {
    return <p>You must be logged in to view this page. Admin access required.</p>;
  }
  // if (!user.isAdmin) { // Example of a role check
  //   return <p>Access Denied. Administrator privileges required.</p>;
  // }


  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '200px', background: '#f4f4f4', padding: '20px', minHeight: '100vh' }}>
        <h3>Admin Menu</h3>
        <nav>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/skills">Manage Skills</Link></li>
            {/* Add links to Manage Quizzes, Manage Tasks etc. here later */}
          </ul>
        </nav>
      </aside>
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <Outlet /> {/* This is where nested admin routes will render their components */}
      </main>
    </div>
  );
};

export default AdminLayout;
