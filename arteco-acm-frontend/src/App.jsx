import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { theme } from './config/theme';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Homepage from './components/Homepage.jsx';
import ArtworkList from './components/ArtworkList.jsx'; 
import ArtworkDetails from './components/ArtworkDetails.jsx';
import ArtistList from './components/ArtistList.jsx';
import ArtistDetails from './components/ArtistDetails.jsx';
import AppraisalList from './components/AppraisalList.jsx';
import AddAppraisal from './components/AddAppraisal.jsx';
import CollectionsList from './components/CollectionsList.jsx';
import CreateCollection from './components/CreateCollection.jsx';
import Profile from './components/Profile.jsx';
import AuditLogs from './components/AuditLogs.jsx';
import MainLayout from './components/MainLayout.jsx';

//Push build
// Checks for the session token (ISO27001 Compliance)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public Authentication - No Navbar/Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* All Managed Routes wrapped in MainLayout */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/home" element={<Homepage />} />
                    <Route path="/collections" element={<CollectionsList />} />
                    <Route path="/collections/new" element={<CreateCollection />} />
                    <Route path="/artworks" element={<ArtworkList />} />
                    <Route path="/artwork/:id" element={<ArtworkDetails />} />
                    <Route path="/artists" element={<ArtistList />} />
                    <Route path="/artist/:id" element={<ArtistDetails />} />
                    <Route path="/appraisals" element={<AppraisalList />} />
                    <Route path="/add-appraisal" element={<AddAppraisal />} />
                    <Route path="/add-appraisal/:artworkId" element={<AddAppraisal />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    
                    {/* Default redirection */}
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;