import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArtecoShell } from '@arteco/shared';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', key: 'home', path: '/home', onClick: () => navigate('/home') },
    { label: 'Collections', key: 'collections', path: '/collections', onClick: () => navigate('/collections') },
    { label: 'Artworks', key: 'artworks', path: '/artworks', onClick: () => navigate('/artworks') },
    { label: 'Artists', key: 'artists', path: '/artists', onClick: () => navigate('/artists') },
    { label: 'Appraisals', key: 'appraisals', path: '/appraisals', onClick: () => navigate('/appraisals') },
    { label: 'Profile', key: 'profile', path: '/profile', onClick: () => navigate('/profile') },
  ];

  return (
    <ArtecoShell 
      title="Collection Manager" 
      navItems={navItems}
      fullWidth={true}
    >
      {children}
    </ArtecoShell>
  );
};

export default MainLayout;