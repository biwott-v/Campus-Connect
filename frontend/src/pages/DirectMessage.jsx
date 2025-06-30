import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/MessageBubble';

const DirectMessagesPage = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await api.get('/api/users');
        const filteredUsers = usersResponse.data.filter(user => user.id !== currentUser.id);
        setUsers(filteredUsers);
        
        if (filteredUsers.length > 0) {
          setSelectedUser(filteredUsers[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      
      try {
        const response = await api.get('/api/direct-messages', {
          params: {
            sender_id: currentUser.id,
            receiver_id: selectedUser.id
          }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
  }, [selectedUser, currentUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      const response = await api.post('/api/direct-messages', {
        content: newMessage,
        receiver_id: selectedUser.id
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
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
    <div className="direct-messages-page">
      <div className="page-header">
        <h1>Direct Messages</h1>
        <p>Communicate privately with peers</p>
      </div>
      
      <div className="dm-container">
        <div className="user-list">
          <h3>Students</h3>
          {users.map(user => (
            <div 
              key={user.id} 
              className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="user-avatar">{user.username.charAt(0)}</div>
              <div className="user-info">
                <div className="username">{user.username}</div>
                <div className="field">{user.field_of_study}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="message-container">
          {selectedUser ? (
            <>
              <div className="message-header">
                <h2>{selectedUser.username}</h2>
              </div>
              
              <div className="messages">
                {messages.map(message => (
                  <MessageBubble 
                    key={message.id} 
                    message={{
                      ...message,
                      sender_username: message.sender_id === currentUser.id 
                        ? currentUser.username 
                        : selectedUser.username
                    }} 
                  />
                ))}
              </div>
              
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="select-user-prompt">
              <div className="icon">👤</div>
              <h3>Select a student to message</h3>
              <p>Choose a peer from the list to start a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessagesPage;