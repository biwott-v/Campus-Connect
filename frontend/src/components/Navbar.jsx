import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Library' },
    { path: '/groups', label: 'Groups' },
    { path: '/messages', label: 'Messages' },
    { path: '/upload', label: 'Upload' },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <span className="navbar-logo">📚</span>
            CampusConnect
          </Link>
          
          <div className="navbar-links">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="navbar-actions">
            {currentUser ? (
              <>
                <div className="navbar-user">Hi, victor</div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="btn btn-primary"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary"
                >
                  Login
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;