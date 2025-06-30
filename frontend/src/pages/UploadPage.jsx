import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import FileUpload from '../components/FileUpload';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('file', file);
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('category', formData.category);

      await api.post('/api/resources', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload resource. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="page-header">
        <h1>Upload Resource</h1>
        <p>Share study materials with your peers</p>
      </div>
      
      {success ? (
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="upload-success"
        >
          <div className="success-icon">✓</div>
          <h2>Upload Successful!</h2>
          <p>Your resource has been shared with the community.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Back to Library
          </motion.button>
        </motion.div>
      ) : (
        <div className="upload-form-container">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="file-upload-area">
              <FileUpload onFileChange={setFile} currentFile={file} />
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Resource title"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Brief description of the resource"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
              >
                <option value="">Select a category</option>
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Assignments">Assignments</option>
                <option value="Study Guides">Study Guides</option>
                <option value="Research Papers">Research Papers</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading || !file}
              className="btn btn-primary upload-btn"
            >
              {uploading ? 'Uploading...' : 'Share Resource'}
            </motion.button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadPage;