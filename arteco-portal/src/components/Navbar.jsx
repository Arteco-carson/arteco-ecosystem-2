import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { gsap } from 'gsap';
import { Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onLoginClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSub, setActiveMobileSub] = useState(null); // State for Mobile Accordion
  
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileLinksRef = useRef([]);

  // Menu Data
  const menuItems = [
    { title: 'About', submenu: ['Our Story', 'The Team', 'Careers'] },
    { title: 'Solutions', submenu: ['For Collectors', 'For Galleries', 'For Logistics'] },
    { title: 'Contact', submenu: ['Global Offices', 'Support', 'Press'] },
  ];

  // Helper: Toggle Mobile Submenu Accordion
  const toggleMobileSub = (index) => {
    setActiveMobileSub(activeMobileSub === index ? null : index);
  };

  // 1. SAFETY: Auto-close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. ANIMATION: Mobile Drawer Slide-in
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      if (mobileMenuOpen) {
        // Open Sequence
        gsap.to(mobileMenuRef.current, { x: '0%', duration: 0.5, ease: 'power3.out' });
        // Stagger links entrance
        gsap.fromTo(mobileLinksRef.current, 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power2.out', delay: 0.2 }
        );
      } else {
        // Close Sequence
        gsap.to(mobileMenuRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
        setActiveMobileSub(null); // Reset accordion on close
      }
    }, navRef); // Scope animations to this component

    return () => ctx.revert();
  }, [mobileMenuOpen]);

  // 3. ANIMATION: Desktop Hover Effects
  const handleMouseEnter = (e) => {
    const submenu = e.currentTarget.querySelector('.mega-menu');
    if (submenu) {
      // Overwrite: true prevents animation conflicts ("ghosting")
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
      {/* HEADER CONTAINER (Desktop Pills + Mobile Toggle Button) */}
      <header className="navbar-container" ref={navRef}>
        
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
              
              {/* Desktop Submenu */}
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

        {/* MOBILE TOGGLE BUTTON */}
        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </header>

      {/* MOBILE DRAWER (Right Side Slide-out) */}
      <div ref={mobileMenuRef} className="mobile-overlay">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mobile-item-container" ref={el => mobileLinksRef.current[index] = el}>
              
              {/* Main Link + Chevron */}
              <div 
                className="mobile-link" 
                onClick={() => toggleMobileSub(index)}
              >
                {item.title}
                <ChevronDown 
                  className={`chevron ${activeMobileSub === index ? 'rotate' : ''}`} 
                  size={18} 
                />
              </div>

              {/* Submenu Accordion */}
              <ul className={`mobile-submenu ${activeMobileSub === index ? 'open' : ''}`}>
                {item.submenu.map((sub, idx) => (
                  <li key={idx} onClick={() => setMobileMenuOpen(false)}>
                    {sub}
                  </li>
                ))}
              </ul>

            </li>
          ))}
          
          {/* Mobile Login Button */}
          <li ref={el => mobileLinksRef.current[menuItems.length] = el}>
             <button 
               className="mobile-login-btn" 
               onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
             >
               Login
             </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;