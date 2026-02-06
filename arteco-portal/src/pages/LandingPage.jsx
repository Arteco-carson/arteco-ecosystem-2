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

const LandingPage = () => {
  const brandBlue = appTheme.token.colorPrimary;
  
  // STATE
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  
  // Search Animation & AI State
  const [searchActive, setSearchActive] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const heroImages = [hero1, hero2]; 

  // SLIDESHOW EFFECT
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // --- HELPER: FORMAT TEXT WITH LINE BREAKS ---
  const formatTextWithBreaks = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    let formatted = '';
    for (let i = 0; i < words.length; i++) {
      formatted += words[i] + ' ';
      // Add a double newline every 20 words for clean separation
      if ((i + 1) % 20 === 0) formatted += '\n'; 
    }
    return formatted;
  };

  // --- AZURE OPENAI HANDLER ---
  const handleSearch = async () => {
    if (!question.trim()) return;

    setSearchActive(true);
    setLoading(true);
    setAiResponse(''); 

    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY;
    const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = "2024-08-01-preview";

    const websiteContext = `
      OFFICIAL ARTECO WEBSITE CONTENT:
      Headline: Give every collection the care it deserves.
      Mission: Connect to verified professionals worldwide, securely manage your assets, and streamline operations, with AI, data, and applications built to simplify collection management.
      CORE TOOLS:
      1. Collection Management: Centralized command center for item lifecycles.
      2. Condition Reporting: Standardized, auditable tool digitizing inspections.
      3. Service Provider ERP: Intelligent shipping module automating logistics.
      4. Global Directory: Curated, verifiable directory of art professionals.
      5. Market Place: Secure trading and transparent asset history.
      6. Smart Integrations: Connects disparate systems.
    `;

    const instructions = `
      You are ARTECO, the AI assistant for this platform.
      CONTEXT: ${websiteContext}
      INSTRUCTIONS:
      1. Answer using ONLY the Context provided.
      2. If the answer is not in the context, state you can only discuss Arteco features.
      3. Keep response strictly between 70-120 words.
      4. Tone: Professional and concise.
    `;

    try {
      const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: instructions + "\n\nUSER QUESTION: " + question }
          ],
          temperature: 1, 
          max_completion_tokens: 2000 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("FULL AZURE ERROR:", errorData);
        throw new Error(errorData.error?.message || `Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const rawContent = data.choices[0].message.content;
        setAiResponse(formatTextWithBreaks(rawContent));
      } else {
        setAiResponse("No analysis returned.");
      }

    } catch (error) {
      console.error("Catch Block Error:", error);
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <ConfigProvider theme={appTheme}>
      <div className="lp-container">
        
        {/* NAVIGATION BAR (NOW INCLUDES THE LOGO LOGIC) */}
        <Navbar onLoginClick={() => setIsLoginOpen(true)} />

        {/* HERO SECTION */}
        <div className="lp-hero-section">
          {/* Left Column */}
          <div className="lp-hero-left">
            
            {/* SPACER DIV: Keeps text aligned (Height 80px + 4rem margin matches old logo) */}
            <div style={{ height: '80px', marginBottom: '4rem' }}></div>
            
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
                   disabled={loading} 
                 />
                 <SendOutlined 
                   style={{ color: '#0D0060', fontSize: '1.2rem', cursor: 'pointer', opacity: loading ? 0.5 : 1 }} 
                   onClick={!loading ? handleSearch : null}
                 />
               </div>

               {/* Results Box (Fades In) */}
               {searchActive && (
                 <div className="lp-result-box">
                   {loading 
                     ? <span style={{ fontStyle: 'italic', color: '#666' }}>Analyzing Request...</span> 
                     : <pre style={{ 
                         whiteSpace: 'pre-wrap', 
                         fontFamily: "'Lato', sans-serif", 
                         margin: 0 
                       }}>
                         {aiResponse || "No data returned."}
                       </pre>
                   }
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
                <Tooltip title="Secure trading and transparent asset history..." color={brandBlue}>
                  <ShopOutlined style={{ fontSize: '24px', color: brandBlue, cursor: 'pointer' }} />
                </Tooltip>
                <h4>MARKET PLACE</h4>
                <p>A standardized, auditable condition reporting tool that digitizes inspections and restoration logs so conservation data travels with the asset and informs valuation, insurance and shipping decisions across Arteco.</p>
                <a href="#" className="lp-link">Learn more</a>
             </div>

             <div className="lp-tool-card">
                <Tooltip title="Connects disparate systems..." color={brandBlue}>
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