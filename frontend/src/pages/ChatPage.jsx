import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import MessageBubble from '../components/MessageBubble';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const [groupResponse, messagesResponse] = await Promise.all([
          api.get(`/api/groups/${groupId}`),
          api.get(`/api/messages?group_id=${groupId}`)
        ]);
        
        setGroup(groupResponse.data);
        setMessages(messagesResponse.data);
      } catch (error) {
        console.error('Error fetching group data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    
    try {
      let resourceId = null;
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('description', 'Shared in group chat');
        formData.append('category', 'Chat Attachment');
        
        const resourceResponse = await api.post('/api/resources', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        resourceId = resourceResponse.data.resource.id;
      }
      
      const messageResponse = await api.post('/api/messages', {
        content: newMessage,
        group_id: groupId,
        resource_id: resourceId
      });
      
      setMessages([...messages, messageResponse.data]);
      setNewMessage('');
      setFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="chat-page animate-fade-in">
      <div className="chat-header">
        <h1>{group.name}</h1>
        <span className="member-count">{group.member_count} members</span>
      </div>
      
      <div className="chat-container">
        <div className="chat-info">
          <p>{group.description}</p>
        </div>
        
        <div className="chat-messages">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={{
                ...message,
                sender_id: message.user_id,
                sender_username: message.uploader
              }} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input">
          {file && (
            <div className="file-preview">
              <span>{file.name}</span>
              <button 
                onClick={() => setFile(null)}
                className="remove-file"
              >
                ✕
              </button>
            </div>
          )}
          
          <div className="file-upload-container">
            <FileUpload onFileChange={setFile} />
          </div>
          
          <div className="message-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !file}
              className="btn btn-primary send-btn"
            >
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;