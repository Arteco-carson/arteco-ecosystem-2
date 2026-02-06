import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { gsap } from 'gsap';
import { Menu, X, ChevronDown } from 'lucide-react';
import logoImg from '../assets/White ARTECO logo.png'; // <--- IMPORT LOGO
import './Navbar.css';

const Navbar = ({ onLoginClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSub, setActiveMobileSub] = useState(null);
  
  // NEW: State to track if user has scrolled down
  const [isScrolled, setIsScrolled] = useState(false);

  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileLinksRef = useRef([]);

  const menuItems = [
    { title: 'About', submenu: ['Our Story', 'The Team', 'Careers'] },
    { title: 'Solutions', submenu: ['For Collectors', 'For Galleries', 'For Logistics'] },
    { title: 'Contact', submenu: ['Global Offices', 'Support', 'Press'] },
  ];

  const toggleMobileSub = (index) => {
    setActiveMobileSub(activeMobileSub === index ? null : index);
  };

  // 1. SCROLL LISTENER (For Logo Animation)
  useEffect(() => {
    const handleScroll = () => {
      // Threshold: 50px. When passed, snap to "Pill Mode"
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. SAFETY: Auto-close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. ANIMATION: Mobile Drawer Slide-in
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      if (mobileMenuOpen) {
        gsap.to(mobileMenuRef.current, { x: '0%', duration: 0.5, ease: 'power3.out' });
        gsap.fromTo(mobileLinksRef.current, 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power2.out', delay: 0.2 }
        );
      } else {
        gsap.to(mobileMenuRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
        setActiveMobileSub(null); 
      }
    }, navRef);

    return () => ctx.revert();
  }, [mobileMenuOpen]);

  const handleMouseEnter = (e) => {
    const submenu = e.currentTarget.querySelector('.mega-menu');
    if (submenu) {
      gsap.to(submenu, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out', overwrite: true });
    }
  };

  const handleMouseLeave = (e) => {
    const submenu = e.currentTarget.querySelector('.mega-menu');
    if (submenu) {
      gsap.to(submenu, { autoAlpha: 0, y: 10, duration: 0.2, ease: 'power2.in', overwrite: true });
    }
  };

  return (
    <>
      <header className="navbar-container" ref={navRef}>
        
        {/* --- NEW: LEFT SIDE LOGO PILL --- */}
        {/* Behaves as large/transparent when at top, morphs to glass pill on scroll */}
        <div 
          className={`glass-pill logo-pill ${isScrolled ? 'scrolled' : 'hero-state'}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Click to scroll top
        >
          <img src={logoImg} alt="ARTECO" className="nav-logo-img" />
        </div>

        {/* --- RIGHT SIDE NAVIGATION --- */}
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* DESKTOP MENU PILL */}
          <nav className="glass-pill nav-menu-pill">
            {menuItems.map((item, index) => (
              <div 
                key={index} 
                className="nav-item"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span className="nav-link">{item.title}</span>
                <div className="mega-menu">
                  <ul>
                    {item.submenu.map((sub, idx) => (
                      <li key={idx}>{sub}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </nav>

          {/* LOGIN PILL */}
          <div className="glass-pill login-pill" onClick={onLoginClick}>
             <span className="nav-link">Login</span>
          </div>

          {/* MOBILE TOGGLE */}
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </header>

      {/* MOBILE DRAWER (Unchanged) */}
      <div ref={mobileMenuRef} className="mobile-overlay">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mobile-item-container" ref={el => mobileLinksRef.current[index] = el}>
              <div className="mobile-link" onClick={() => toggleMobileSub(index)}>
                {item.title}
                <ChevronDown className={`chevron ${activeMobileSub === index ? 'rotate' : ''}`} size={18} />
              </div>
              <ul className={`mobile-submenu ${activeMobileSub === index ? 'open' : ''}`}>
                {item.submenu.map((sub, idx) => (
                  <li key={idx} onClick={() => setMobileMenuOpen(false)}>{sub}</li>
                ))}
              </ul>
            </li>
          ))}
          <li ref={el => mobileLinksRef.current[menuItems.length] = el}>
             <button className="mobile-login-btn" onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}>
               Login
             </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;