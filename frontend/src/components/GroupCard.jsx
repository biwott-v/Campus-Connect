import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GroupCard = ({ group }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group-card"
    >
      <div className="group-header">
        <div className="group-icon">👥</div>
        <div>
          <h3 className="group-name">{group.name}</h3>
          <div className="group-members">{group.member_count} members</div>
        </div>
      </div>
      <p className="group-description">{group.description}</p>
      <div className="group-footer">
        <div className="group-category">{group.category}</div>
        <Link to={`/chat/${group.id}`} className="join-button">
          Join Chat
        </Link>
      </div>
    </motion.div>
  );
};

export default GroupCard;