import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { theme as appTheme } from '../config/theme';
import { SendOutlined, AppstoreOutlined, GlobalOutlined, ShopOutlined, SafetyCertificateOutlined, RocketOutlined, LineChartOutlined } from '@ant-design/icons';
import { LoginModal } from '@arteco/shared';
import Navbar from '../components/Navbar'; 
import './LandingPage.css'; 

// 1. ASSET IMPORTS
import hero1 from '../assets/LandingHero1.png';
import hero2 from '../assets/LandingHero2.jpeg';
import teamImg from '../assets/Team.jpg';
import galleryImg from '../assets/Gallery.jpg';
import logoImg from '../assets/White ARTECO logo.png';

const LandingPage = () => {
  const brandBlue = appTheme.token.colorPrimary;
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // 2. SLIDESHOW CONFIGURATION
  const heroImages = [hero1, hero2]; 
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <ConfigProvider theme={appTheme}>
      <div className="lp-container">
        
        {/* NAVIGATION BAR - Passing the Login Trigger */}
        <Navbar onLoginClick={() => setIsLoginOpen(true)} />

        {/* HERO SECTION */}
        <div className="lp-hero-section">
          <div className="lp-hero-left">
            <img src={logoImg} alt="ARTECO" className="lp-logo-img" />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="lp-hero-heading">
                Give every collection<br/>
                the care it deserves.
              </div>
              <div className="lp-hero-line"></div>
              <div className="lp-hero-subtext">
                Connect to verified professionals worldwide, securely manage your assets, and streamline operations, with AI, data, and applications built to simplify collection management.
              </div>
            </div>
          </div>

          <div className="lp-hero-right">
             {/* Stacked Slideshow */}
             {heroImages.map((img, index) => (
               <div 
                 key={index}
                 className={`lp-slide-layer ${index === heroIndex ? 'active' : ''}`}
                 style={{ backgroundImage: `url(${img})` }}
               />
             ))}

             <div className="lp-search-container">
               <input className="lp-search-input" placeholder="Ask a question..." />
               <SendOutlined style={{ color: brandBlue, fontSize: '1.2rem', cursor: 'pointer' }} />
             </div>
          </div>
        </div>

        {/* POWERFUL TOOLS SECTION */}
        <div className="lp-section-white">
          <h2 className="lp-h2">Powerful digital tools - enabling teams, streamlining processes</h2>
          <p className="lp-sub-h2">Your comprehensive directory for art industry services, connecting professionals across fine art moving, storage, conservation, and more.</p>
          
          <div className="lp-grid-6">
             <div className="lp-tool-card">
                <AppstoreOutlined style={{ fontSize: '24px', color: brandBlue }} />
                <h4>COLLECTION MANAGEMENT</h4>
                <p>A centralized, digital command center for galleries, dealers and collectors that records every item’s lifecycle — from acquisition through loan, exhibition and sale — enabling coordinated operations across the entire Arteco-System.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>
             <div className="lp-tool-card">
                <SafetyCertificateOutlined style={{ fontSize: '24px', color: brandBlue }} />
                <h4>CONDITION REPORTING</h4>
                <p>A standardized, auditable condition reporting tool that digitizes inspections and restoration logs so conservation data travels with the asset and informs valuation, insurance and shipping decisions across Arteco.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>
             <div className="lp-tool-card">
                <RocketOutlined style={{ fontSize: '24px', color: brandBlue }} />
                <h4>SERVICE PROVIDER ERP</h4>
                <p>An intelligent shipping module that automates logistics for artwork movement by linking item specs, condition data, insurance and customs requirements to carrier and route selection.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>
             <div className="lp-tool-card">
                <GlobalOutlined style={{ fontSize: '24px', color: brandBlue }} />
                <h4>GLOBAL DIRECTORY</h4>
                <p>A curated, verifiable directory of galleries, conservators, shippers, framers and other art service professionals that fosters trust and efficient talent sourcing across the Arteco platform.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>
             <div className="lp-tool-card">
                <ShopOutlined style={{ fontSize: '24px', color: brandBlue }} />
                <h4>MARKET PLACE</h4>
                <p>A standardized, auditable condition reporting tool that digitizes inspections and restoration logs so conservation data travels with the asset and informs valuation, insurance and shipping decisions across Arteco.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>
             <div className="lp-tool-card">
                <LineChartOutlined style={{ fontSize: '24px', color: brandBlue }} />
                <h4>SMART INTEGRATIONS</h4>
                <p>An intelligent shipping module that automates logistics for artwork movement by linking item specs, condition data, insurance and customs requirements to carrier and route selection.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>
          </div>
          <div className="lp-section-divider"></div>
        </div>

        {/* GLOBAL COMMUNITY */}
        <div className="lp-section-white" style={{ paddingTop: 0 }}>
          <h2 className="lp-h2" style={{ fontSize: '2rem' }}>Join our Global Community</h2>
          <p className="lp-sub-h2">Your comprehensive directory for art industry services, connecting professionals across fine art moving, storage, conservation, and more.</p>

          <div className="lp-split-section">
            <div className="lp-split-left">
              <div className="lp-tile-stack">
                <div className="lp-community-tile">
                  <GlobalOutlined style={{ fontSize: '24px', color: brandBlue }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>GLOBAL DIRECTORY</h4>
                    <p style={{ margin: 0 }}>Curated database connecting verified art service providers globally.</p>
                  </div>
                </div>
                <div className="lp-community-tile">
                  <RocketOutlined style={{ fontSize: '24px', color: brandBlue }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>SEAMLESS COLLABORATION</h4>
                    <p style={{ margin: 0 }}>Curated database connecting verified art service providers globally.</p>
                  </div>
                </div>
                <div className="lp-community-tile">
                  <ShopOutlined style={{ fontSize: '24px', color: brandBlue }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>MARKET PLACE</h4>
                    <p style={{ margin: 0 }}>Curated database connecting verified art service providers globally.</p>
                  </div>
                </div>
              </div>
              <button className="lp-btn-primary" onClick={() => setIsLoginOpen(true)}>
                Register
              </button>
            </div>
            <div className="lp-split-right" style={{ backgroundImage: `url(${teamImg})` }}></div>
          </div>
          <div className="lp-section-divider"></div>
        </div>

        {/* INDUSTRY INSIGHTS */}
        <div className="lp-section-white" style={{ paddingTop: 0 }}>
          <div className="lp-insights-container">
            <div className="lp-insights-img" style={{ backgroundImage: `url(${galleryImg})` }}></div>
            <div className="lp-insights-text">
              <h2 className="lp-h2" style={{ marginTop: 0 }}>Industry Insights</h2>
              <p className="lp-sub-h2" style={{ maxWidth: '100%' }}>
                A standardized, auditable condition reporting tool that digitizes inspections and restoration logs so conservation data travels with the asset and informs valuation, insurance and shipping decisions across Arteco.
              </p>
              <button className="lp-btn-primary" onClick={() => setIsLoginOpen(true)}>
                Join Now
              </button>
            </div>
          </div>
        </div>

        <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    </ConfigProvider>
  );
};

export default LandingPage;