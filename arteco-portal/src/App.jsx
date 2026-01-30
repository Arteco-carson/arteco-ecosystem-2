import React, { useState } from 'react';
import { ConfigProvider, Typography, Card, Alert } from 'antd';
import MainLayout from './components/layout/MainLayout';
import OmniBox from './components/OmniBox';
import IndustryNews from './components/IndustryNews';
import { theme } from './config/theme';
import './App.css';

const { Title, Text } = Typography;

function App() {
  const [omniboxResult, setOmniboxResult] = useState(null);

  const handleOmniBoxResult = (result) => {
    setOmniboxResult(result);
  };

  return (
    <ConfigProvider theme={theme}>
      <MainLayout>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: '60px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: 60, width: '100%', maxWidth: 800 }}>
               <Title level={1} style={{ fontSize: '48px', marginBottom: '16px', color: '#1f1f1f' }}>Welcome back, Ian</Title>
               <Text type="secondary" style={{ fontSize: '24px' }}>The unified ecosystem for art collection management.</Text>
               
               <div style={{ marginTop: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '100%', maxWidth: '720px' }}>
                    <OmniBox onResult={handleOmniBoxResult} />
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
                       <Alert
                          message={<span style={{ fontSize: '18px', fontWeight: 500 }}>Dashboard Ready</span>}
                          description={<span style={{ fontSize: '16px' }}>Use the Concierge Omni-box above to start a task, or select a module from the menu.</span>}
                          type="info"
                          showIcon
                          style={{ marginBottom: 20, padding: '24px' }}
                       />
                    )}

                    <IndustryNews />
                 </div>
            </div>
          </div>
      </MainLayout>
    </ConfigProvider>
  );
}

export default App;