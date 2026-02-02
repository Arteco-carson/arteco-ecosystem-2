import React, { useState, useEffect } from 'react';
import { ConfigProvider, Typography, Card, theme } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { SharedTest, AuthProvider, useAuth } from '@arteco/shared';
import MainLayout from './components/layout/MainLayout';
import OmniBox from './components/OmniBox';
import IndustryNews from './components/IndustryNews';
import LandingPage from './pages/LandingPage';
import { theme as appTheme } from './config/theme';
import './App.css';

const { Title, Text } = Typography;
const { useToken } = theme;

// --- 1.1 DASHBOARD CONTENT (Uses Token) ---
const DashboardContent = ({ omniboxResult, acmUrl, onOmniboxResult }) => {
  const { token } = useToken();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: '60px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: 60, width: '100%', maxWidth: 800 }}>
         <Title level={1} style={{ fontSize: '48px', marginBottom: '16px', color: '#1f1f1f' }}>Welcome back, Ian</Title>
         <Text type="secondary" style={{ fontSize: '24px' }}>The unified ecosystem for art collection management.</Text>
         
         <div style={{ marginTop: '40px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '720px' }}>
              <OmniBox onResult={onOmniboxResult} />
            </div>
         </div>
      </div>

      <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%' }}>
              
              {omniboxResult ? (
                 <Card 
                    style={{ marginBottom: 20, borderColor: '#1890ff', width: '100%' }} 
                    title={<span style={{ fontSize: '24px' }}>{`Intent: ${omniboxResult.type}`}</span>}
                 >
                     <Text style={{ fontSize: '20px', display: 'block', marginBottom: '16px' }}>{omniboxResult.message}</Text>
                     <div style={{ marginTop: 15, padding: 20, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                        <Text style={{ fontSize: '18px' }}><strong>Suggested Action:</strong> {omniboxResult.action}</Text>
                     </div>
                 </Card>
              ) : (
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                      <Card
                          hoverable
                          onClick={() => window.location.href = acmUrl} 
                          style={{ borderColor: '#e2e8f0' }}
                      >
                          <Card.Meta
                              avatar={<AppstoreOutlined style={{ fontSize: '32px', color: token.colorPrimary }} />}
                              title={<span style={{ fontSize: '20px', fontWeight: 600 }}>Collection Manager</span>}
                              description={<span style={{ fontSize: '16px' }}>Manage artworks, artists, and valuations.</span>}
                          />
                      </Card>
                 </div>
              )}

              <IndustryNews />
            </div>
      </div>
    </div>
  );
};

// --- 1. THE PRIVATE DASHBOARD (Visible when Logged In) ---
const PrivateDashboard = () => {
  const [omniboxResult, setOmniboxResult] = useState(null);

  // DEPLOYMENT SAFE LOGIC:
  // In Azure (Production), this compiles strictly to '/acm/'.
  // On your Laptop (Dev), it points to the local ACM port including the sub-path.
  const acmUrl = import.meta.env.DEV 
    ? 'http://localhost:5174/acm/' 
    : '/acm/';

  useEffect(() => {
    SharedTest();
  }, []);

  const handleOmniBoxResult = (result) => {
    setOmniboxResult(result);
  };

  return (
    <ConfigProvider theme={appTheme}>
      <MainLayout>
          <DashboardContent 
            omniboxResult={omniboxResult} 
            acmUrl={acmUrl} 
            onOmniboxResult={handleOmniBoxResult} 
          />
      </MainLayout>
    </ConfigProvider>
  );
};

// --- 2. THE GATEKEEPER ---
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  // LOGIC: If logged in -> Private Dashboard. If not -> Public Landing Page.
  return isAuthenticated ? <PrivateDashboard /> : <LandingPage />;
};

// --- 3. ROOT APP ---
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;