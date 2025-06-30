import React, { useState, useEffect } from 'react';
import GroupCard from '../components/GroupCard';
import api from '../services/api';
import { motion } from 'framer-motion';

const GroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'General'
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get('/api/groups');
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup({ ...newGroup, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/groups', newGroup);
      setGroups([...groups, response.data.group]);
      setNewGroup({ name: '', description: '', category: 'General' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="group-page animate-fade-in">
      <div className="page-header">
        <h1>Study Groups</h1>
        <p>Join or create groups to collaborate with peers</p>
      </div>

      <button 
        className="btn btn-primary create-group-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Create New Group'}
      </button>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="group-form"
        >
          <h2>Create New Group</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Group Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGroup.name}
                onChange={handleInputChange}
                placeholder="Enter group name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newGroup.description}
                onChange={handleInputChange}
                placeholder="Enter group description"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={newGroup.category}
                onChange={handleInputChange}
                required
              >
                <option value="General">General</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary">
              Create Group
            </button>
          </form>
        </motion.div>
      )}

      <div className="groups-grid">
        {groups.length > 0 ? (
          groups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No groups found</h3>
            <p>Create a new group to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPage;