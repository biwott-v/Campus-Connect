import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import LibraryPage from './pages/LibraryPage';
import ChatPage from './pages/ChatPage';
import GroupPage from './pages/GroupPage';
import UploadPage from './pages/UploadPage';
import DirectMessagesPage from './pages/DirectMessagesPage';
import EditResourcePage from './pages/EditResourcePage';
import AnimatedRoute from './components/AnimatedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <LibraryPage />
                  </AnimatedRoute>
                </ProtectedRoute>
              } />
              <Route path="/groups" element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <GroupPage />
                  </AnimatedRoute>
                </ProtectedRoute>
              } />
              <Route path="/chat/:groupId" element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <ChatPage />
                  </AnimatedRoute>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <DirectMessagesPage />
                  </AnimatedRoute>
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <UploadPage />
                  </AnimatedRoute>
                </ProtectedRoute>
              } />
              <Route path="/resources/:id/edit" element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <EditResourcePage />
                  </AnimatedRoute>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" replace />;
};

export default App;