import React from 'react';
import { useAuth } from '../context/AuthContext';

const MessageBubble = ({ message }) => {
  const { currentUser } = useAuth();
  const isCurrentUser = message.sender_id === currentUser?.id;

  return (
    <div className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}>
      <div className="message-sender">{message.sender_username}</div>
      <div className="message-content">{message.content}</div>
      {message.resource_id && (
        <div className="message-resource">
          <span className="resource-icon">📎</span>
          <span className="resource-name">Attached Resource</span>
        </div>
      )}
      <div className="message-time">
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default MessageBubble;