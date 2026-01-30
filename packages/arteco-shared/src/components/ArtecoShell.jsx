import React from 'react';
import { Layout, Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
// import { ARTECO_TEAL } from '../index'; // Avoiding circular dependency by using literal or defining here
const ARTECO_TEAL = '#246A73';

const { Header, Content } = Layout;

const ArtecoShell = ({ children, title = "Arteco Portal", navItems = [] }) => {
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
          backgroundColor: ARTECO_TEAL, // Primary Token
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
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
            {title}
          </span>
        </div>

        {/* Center-Left: Navigation Slot */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              type="text"
              style={{ color: 'rgba(255, 255, 255, 0.85)' }}
              href={item.onClick ? undefined : item.path}
              onClick={item.onClick}
            >
              {item.label}
            </Button>
          ))}
        </div>

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

export default ArtecoShell;
