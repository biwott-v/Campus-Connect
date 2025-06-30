import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FileUpload from '../components/FileUpload';

const EditResourcePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await api.get(`/api/resources/${id}`);
        setResource(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          category: response.data.category
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resource:', error);
        navigate('/');
      }
    };
    
    fetchResource();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category
      };
      
      await api.patch(`/api/resources/${id}`, payload);
      
      // If a new file is uploaded
      if (file) {
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
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="edit-resource-page">
      <div className="page-header">
        <h1>Edit Resource</h1>
        <p>Update your shared study material</p>
      </div>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
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
            onChange={(e) => setFormData({...formData, description: e.target.value})}
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
            onChange={(e) => setFormData({...formData, category: e.target.value})}
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
        
        <div className="file-upload-area">
          <FileUpload onFileChange={setFile} currentFile={file} />
          <p className="file-info">Current file: {resource.file_name}</p>
        </div>
        
        <button type="submit" className="btn btn-primary upload-btn">
          Update Resource
        </button>
      </form>
    </div>
  );
};

export default EditResourcePage;