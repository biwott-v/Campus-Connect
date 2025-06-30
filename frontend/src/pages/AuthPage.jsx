import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (isLogin) {
      await login(formData.get('email'), formData.get('password'));
    } else {
      await register({
        email: formData.get('email'),
        username: formData.get('username'),
        password: formData.get('password'),
        full_name: formData.get('full_name')
      });
    }
    navigate('/');
  };

  return (
    <div className="auth-page">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome!' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter any credentials to continue' : 'All fields are optional'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input name="username" type="text" placeholder="example@gmail.com" />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input name="full_name" type="text" placeholder="*********" />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="example@gmail.com" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="*********" />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary"
          >
            {isLogin ? 'Login' : 'Register'}
          </motion.button>
        </form>
        
        <div className="auth-footer">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="auth-toggle"
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;