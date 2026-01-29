import React, { useState } from 'react';
import { ConfigProvider, Layout, Typography, theme, Button, Avatar, Space, Card, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import OmniBox from './components/OmniBox';
import IndustryNews from './components/IndustryNews';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [omniboxResult, setOmniboxResult] = useState(null);

  const handleLoginToggle = () => {
    setIsLoggedIn(!isLoggedIn);
    setOmniboxResult(null); // Clear context on switch
  };

  const handleOmniBoxResult = (result) => {
    setOmniboxResult(result);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
             <div className="demo-logo" style={{ marginRight: 16 }}>🎨</div>
             <Title level={4} style={{ margin: 0 }}>Arteco Portal</Title>
          </div>
          <div>
            {isLoggedIn ? (
              <Space>
                <Text strong>Ian (Admin)</Text>
                <Avatar icon={<UserOutlined />} />
                <Button type="link" onClick={handleLoginToggle}>Sign Out</Button>
              </Space>
            ) : (
              <Button type="primary" onClick={handleLoginToggle}>Sign In</Button>
            )}
          </div>
        </Header>
        
        <Content style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 40, width: '100%', maxWidth: 800 }}>
             <Title level={2}>{isLoggedIn ? "Welcome back, Ian" : "Welcome to Arteco"}</Title>
             <Text type="secondary">The unified ecosystem for art collection management.</Text>
          </div>

          <div style={{ width: '100%', maxWidth: 600, marginBottom: 40 }}>
            <OmniBox onResult={handleOmniBoxResult} />
          </div>

          <div
            style={{
              background: colorBgContainer,
              padding: 24,
              borderRadius: borderRadiusLG,
              width: '100%',
              maxWidth: 900,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {!isLoggedIn ? (
               <IndustryNews />
            ) : (
               <div style={{ width: '100%' }}>
                  <Title level={4}>Quick Actions</Title>
                  
                  {omniboxResult ? (
                     <Card 
                        style={{ marginTop: 20, borderColor: '#1890ff' }} 
                        title={`Intent: ${omniboxResult.type}`}
                     >
                         <Text>{omniboxResult.message}</Text>
                         <div style={{ marginTop: 15, padding: 10, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                            <strong>Suggested Action:</strong> {omniboxResult.action}
                         </div>
                     </Card>
                  ) : (
                     <Alert
                        message="Dashboard Ready"
                        description="Use the Omni-box above to start a task, or select a module from the menu."
                        type="info"
                        showIcon
                        style={{ marginTop: 20 }}
                     />
                  )}
               </div>
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Arteco Ecosystem ©{new Date().getFullYear()} Created by Arteco System Ltd
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
