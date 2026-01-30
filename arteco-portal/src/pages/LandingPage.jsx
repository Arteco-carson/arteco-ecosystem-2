import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Space, Button } from 'antd';
import { 
  BankOutlined, 
  ScanOutlined, 
  LineChartOutlined, 
  ArrowRightOutlined 
} from '@ant-design/icons';
import { LoginModal } from '@arteco/shared';
import './LandingPage.css'; // Import our new styles

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // 🖼️ IMAGE PLACEHOLDERS - Replace these URLs with your local assets later!
  const assets = {
    // A nice dark museum gallery or artwork close-up
    heroBg: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop", 
    logo: "ARTECO" // Or use an <img /> tag here
  };

  return (
    <Layout className="landing-container">
      
      {/* 1. HERO SECTION */}
      <div 
        className="hero-section" 
        style={{ backgroundImage: `url(${assets.heroBg})` }}
      >
        <div className="hero-overlay"></div>
        
        {/* Transparent Navbar embedded in Hero */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '2px' }}>
                {assets.logo}
            </div>
            <Space>
                <button className="btn-nav" onClick={() => setIsLoginOpen(true)}>Sign In</button>
            </Space>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">Preserving Legacy.</h1>
          <p className="hero-subtitle">
            The unified ecosystem for art collection management, <br/> 
            valuation tracking, and condition reporting.
          </p>
          
          <button className="btn-primary-glow" onClick={() => setIsLoginOpen(true)}>
            Enter Ecosystem <ArrowRightOutlined style={{ marginLeft: 8 }} />
          </button>
        </div>
      </div>

      {/* 2. LOGO STRIP (Trusted By) */}
      <div className="section-grey" style={{ padding: '40px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
             <Text type="secondary" style={{ display: 'block', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>
                Trusted by leading institutions
             </Text>
             {/* TODO: Replace this Row with your actual Logo Images.
                 Just map over an array of <img> tags.
             */}
             <Row justify="center" gutter={[48, 16]} align="middle" style={{ opacity: 0.6, filter: 'grayscale(100%)' }}>
                 <Col><span style={{ fontSize: 20, fontWeight: 700, color: '#999' }}>LOUVRE</span></Col>
                 <Col><span style={{ fontSize: 20, fontWeight: 700, color: '#999' }}>TATE</span></Col>
                 <Col><span style={{ fontSize: 20, fontWeight: 700, color: '#999' }}>MOMA</span></Col>
                 <Col><span style={{ fontSize: 20, fontWeight: 700, color: '#999' }}>GUGGENHEIM</span></Col>
             </Row>
          </div>
      </div>

      {/* 3. FEATURE GRID */}
      <Content className="section-white">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <div className="feature-card">
                <BankOutlined className="feature-icon" />
                <Title level={3}>Collection Manager</Title>
                <Text type="secondary">
                  A comprehensive registry for tracking provenance, location, and insurance valuation over time.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="feature-card">
                <ScanOutlined className="feature-icon" />
                <Title level={3}>Defect Reporting</Title>
                <Text type="secondary">
                  Mobile-first tools for conservators to document damage, scratches, and restoration needs in the field.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="feature-card">
                <LineChartOutlined className="feature-icon" />
                <Title level={3}>Market Intelligence</Title>
                <Text type="secondary">
                  Real-time connection to auction results and market indices to keep your valuation accurate.
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </Content>

      {/* 4. FOOTER */}
      <Footer style={{ textAlign: 'center', background: '#111', color: '#666', padding: '60px 0' }}>
        <Title level={4} style={{ color: 'white', letterSpacing: '2px', marginBottom: 20 }}>ARTECO</Title>
        <Space size="large" style={{ marginBottom: 40 }}>
            <a href="#" style={{ color: '#888' }}>About</a>
            <a href="#" style={{ color: '#888' }}>Privacy</a>
            <a href="#" style={{ color: '#888' }}>Contact</a>
        </Space>
        <div>
           <Text style={{ color: '#444' }}>© 2026 Arteco System Ltd. All Rights Reserved.</Text>
        </div>
      </Footer>

      {/* 5. LOGIN MODAL */}
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </Layout>
  );
};

export default LandingPage;