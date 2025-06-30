import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

const ResourceCard = ({ resource, onDelete }) => {
  const { currentUser } = useAuth();
  
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch(extension) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'pptx':
        return '📊';
      case 'jpg':
      case 'png':
        return '🖼️';
      default:
        return '📁';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await api.delete(`/api/resources/${resource.id}`);
        if (onDelete) onDelete(resource.id);
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="resource-card"
    >
      <div className="resource-content">
        <div className="resource-icon">
          {getFileIcon(resource.file_name)}
        </div>
        <div className="resource-details">
          <h3 className="resource-title">{resource.title}</h3>
          <p className="resource-description">{resource.description}</p>
          <div className="resource-meta">
            <span>By: {resource.uploader}</span>
            <span>•</span>
            <span>{resource.category}</span>
          </div>
        </div>
      </div>
      
      <div className="resource-footer">
        <div className="resource-date">
          {new Date(resource.created_at).toLocaleDateString()}
        </div>
        <Link 
          to={`/api/uploads/${resource.id}`} 
          className="resource-download"
        >
          Download
        </Link>
        {currentUser && currentUser.id === resource.uploader_id && (
          <div className="resource-actions">
            <Link 
              to={`/resources/${resource.id}/edit`}
              className="edit-btn"
            >
              Edit
            </Link>
            <button 
              onClick={handleDelete}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResourceCard;