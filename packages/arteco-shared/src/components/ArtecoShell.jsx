import React from 'react';
import { Layout, Avatar, Button, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

// Define tokens locally or import them
const ARTECO_DEEP_BLUE = '#0D0060';

const { Header, Content } = Layout;

export const ArtecoShell = ({ children, title = "Arteco Portal", navItems = [], fullWidth = false, logoSrc }) => {
  const { logout, user } = useAuth();

  // The Dropdown Menu for the User Profile
  const userMenuArgs = {
    items: [
      {
        key: 'profile',
        label: 'My Profile',
        icon: <UserOutlined />,
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: <SettingOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: 'Sign Out',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: () => {
             logout(); // <--- This triggers the logout and redirects to Landing Page
        },
      },
    ]
  };

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
          backgroundColor: ARTECO_DEEP_BLUE, // Updated to Deep Blue
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)' // Added subtle shadow for depth
        }}
      >
        {/* Left: Brand Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {logoSrc && (
              <>
                  <img src={logoSrc} alt="Logo" style={{ height: '32px' }} />
                  <div style={{ width: '1px', height: '20px', backgroundColor: '#FFFFFF', opacity: 0.5 }}></div>
              </>
          )}
          <span
            style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 'bold',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/'} // Clicking title goes home
          >
            {title}
          </span>
        </div>

        {/* Center: Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right: Navigation Items (Optional) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              type="text"
              style={{ color: '#FFFFFF' }}
              href={item.onClick ? undefined : item.path}
              onClick={item.onClick}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Right: User Profile with Dropdown */}
        <Dropdown menu={userMenuArgs} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 12px', borderRadius: '4px', transition: 'background 0.3s' }} className="user-dropdown-trigger">
                {/* We use user?.username but fallback to 'Ian' for now */}
                <span style={{ color: '#ffffff', fontWeight: 500 }}>{user?.username || 'Ian'}</span>
                <Avatar 
                    icon={<UserOutlined style={{ color: ARTECO_DEEP_BLUE }} />} 
                    style={{ backgroundColor: '#ffffff', color: ARTECO_DEEP_BLUE }} 
                />
                <DownOutlined style={{ color: '#FFFFFF', fontSize: '12px' }} />
            </div>
        </Dropdown>
      </Header>

      <Content
        style={{
          width: '100%',
          maxWidth: fullWidth ? '100%' : '1200px',
          margin: '0 auto',
          padding: fullWidth ? '24px 40px' : '24px',
          background: '#f0f2f5',
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

// Default export if you prefer imports without brackets
export default ArtecoShell;