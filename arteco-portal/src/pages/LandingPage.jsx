import React, { useState, useEffect } from 'react';
import { ConfigProvider, Tooltip } from 'antd';
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
  
  // STATE
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  
  // Search Animation State
  const [searchActive, setSearchActive] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const heroImages = [hero1, hero2]; 

  // SLIDESHOW EFFECT
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // SEARCH HANDLER
  const handleSearch = () => {
    if (!question.trim()) return;

    setSearchActive(true);

    // Dummy Response - Deliberately long to trigger scrollbar
    setTimeout(() => {
      const dummyText = `Based on the parameters of your request regarding "${question}", here is the preliminary analysis found within the Arteco ecosystem:\n\n1. Market Context: The artist has seen a 12% increase in auction performance over the last 18 months, particularly in the European sector.\n\n2. Logistics: For a collection of this size, we recommend temperature-controlled consolidation points in Geneva or London before final transit.\n\n3. Conservation Data: Similar works from this period (Late 20th Century) often require specific humidity monitoring (45-55% RH). Our database flags 3 verified conservators in your region with this specific expertise.\n\n4. Documentation: Please ensure all provenance documents are digitized. Our system can automatically tag these against the new entries.\n\n5. Next Steps: Would you like to schedule a valuation with a partner appraiser, or proceed directly to logistics planning?\n\n(This is a generated placeholder response to demonstrate the scrollable text area capability. If the content exceeds the set height, a scrollbar will appear on the right side as requested.)\n\nAdditional filler text to ensure we hit the scroll limit:\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
      
      setAiResponse(dummyText);
    }, 1200); // Waits for the move-up animation to almost finish
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <ConfigProvider theme={appTheme}>
      <div className="lp-container">
        
        {/* NAVIGATION BAR */}
        <Navbar onLoginClick={() => setIsLoginOpen(true)} />

        {/* HERO SECTION */}
        <div className="lp-hero-section">
          {/* Left Column */}
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

          {/* Right Column (Images & Search) */}
          <div className="lp-hero-right">
             
             {/* Slideshow Background */}
             {heroImages.map((img, index) => (
               <div 
                 key={index}
                 className={`lp-slide-layer ${index === heroIndex ? 'active' : ''}`}
                 style={{ backgroundImage: `url(${img})` }}
               />
             ))}

             {/* Search Wrapper */}
             <div className={`lp-search-wrapper ${searchActive ? 'active' : ''}`}>
               
               {/* Input Bar */}
               <div className="lp-search-bar">
                 <input 
                   className="lp-search-input" 
                   placeholder="Ask a question..." 
                   value={question}
                   onChange={(e) => setQuestion(e.target.value)}
                   onKeyDown={handleKeyDown}
                 />
                 <SendOutlined 
                   style={{ color: '#0D0060', fontSize: '1.2rem', cursor: 'pointer' }} 
                   onClick={handleSearch}
                 />
               </div>

               {/* Results Box (Fades In) */}
               {searchActive && (
                 <div className="lp-result-box">
                   {aiResponse || "Analyzing request..."}
                 </div>
               )}

             </div>
          </div>
        </div>

        {/* POWERFUL TOOLS SECTION */}
        <div className="lp-section-white">
          <h2 className="lp-h2">Powerful digital tools - enabling teams, streamlining processes</h2>
          <p className="lp-sub-h2">Your comprehensive directory for art industry services, connecting professionals across fine art moving, storage, conservation, and more.</p>
          
          <div className="lp-grid-6">
             <div className="lp-tool-card">
                <Tooltip title="A centralized, digital command center for galleries, dealers and collectors..." color={brandBlue}>
                  <AppstoreOutlined style={{ fontSize: '24px', color: brandBlue, cursor: 'pointer' }} />
                </Tooltip>
                <h4>COLLECTION MANAGEMENT</h4>
                <p>A centralized, digital command center for galleries, dealers and collectors that records every item’s lifecycle — from acquisition through loan, exhibition and sale — enabling coordinated operations across the entire Arteco-System.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>
             
             <div className="lp-tool-card">
                <Tooltip title="A standardized, auditable condition reporting tool that digitizes inspections..." color={brandBlue}>
                  <SafetyCertificateOutlined style={{ fontSize: '24px', color: brandBlue, cursor: 'pointer' }} />
                </Tooltip>
                <h4>CONDITION REPORTING</h4>
                <p>A standardized, auditable condition reporting tool that digitizes inspections and restoration logs so conservation data travels with the asset and informs valuation, insurance and shipping decisions across Arteco.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>

             <div className="lp-tool-card">
                <Tooltip title="An intelligent shipping module that automates logistics for artwork movement..." color={brandBlue}>
                  <RocketOutlined style={{ fontSize: '24px', color: brandBlue, cursor: 'pointer' }} />
                </Tooltip>
                <h4>SERVICE PROVIDER ERP</h4>
                <p>An intelligent shipping module that automates logistics for artwork movement by linking item specs, condition data, insurance and customs requirements to carrier and route selection.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>

             <div className="lp-tool-card">
                <Tooltip title="A curated, verifiable directory of galleries, conservators, shippers..." color={brandBlue}>
                  <GlobalOutlined style={{ fontSize: '24px', color: brandBlue, cursor: 'pointer' }} />
                </Tooltip>
                <h4>GLOBAL DIRECTORY</h4>
                <p>A curated, verifiable directory of galleries, conservators, shippers, framers and other art service professionals that fosters trust and efficient talent sourcing across the Arteco platform.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>

             <div className="lp-tool-card">
                <Tooltip title="A standardized, auditable condition reporting tool that digitizes inspections..." color={brandBlue}>
                  <ShopOutlined style={{ fontSize: '24px', color: brandBlue, cursor: 'pointer' }} />
                </Tooltip>
                <h4>MARKET PLACE</h4>
                <p>A standardized, auditable condition reporting tool that digitizes inspections and restoration logs so conservation data travels with the asset and informs valuation, insurance and shipping decisions across Arteco.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>

             <div className="lp-tool-card">
                <Tooltip title="An intelligent shipping module that automates logistics for artwork movement..." color={brandBlue}>
                  <LineChartOutlined style={{ fontSize: '24px', color: brandBlue, cursor: 'pointer' }} />
                </Tooltip>
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