import React, { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';

const LibraryPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get('/api/resources');
        setResources(response.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(resources.map(resource => resource.category))];

  const handleDelete = (deletedId) => {
    setResources(resources.filter(r => r.id !== deletedId));
  };

  return (
    <div className="library-page animate-fade-in">
      <div className="page-header">
        <h1>Resource Library</h1>
        <p>Discover and access study materials shared by your peers</p>
      </div>
      
      <div className="library-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>No resources found</h3>
              <p>Try adjusting your search or upload a new resource</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;