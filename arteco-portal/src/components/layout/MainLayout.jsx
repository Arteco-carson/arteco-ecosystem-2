import React from 'react';
import { Layout, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const MainLayout = ({ children, onOmniBoxResult }) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          height: '64px',
          padding: '0 24px',
          backgroundColor: '#246A73', // Primary Token
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand Text */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              color: '#ffffff', // Surface Color
              fontSize: '20px',
              fontWeight: 'bold',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Arteco Portal
          </span>
        </div>

        {/* Center: Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right: User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#ffffff', fontWeight: 500 }}>Ian</span>
            <Avatar 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#ffffff', color: '#246A73', cursor: 'pointer' }} 
            />
        </div>
      </Header>

      <Content
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
          background: '#f0f2f5', // Background Token
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;