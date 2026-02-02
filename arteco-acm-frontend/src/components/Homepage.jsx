import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Library, 
  Image, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { theme } from 'antd';
import FeatureDescription from './FeatureDescription.jsx';
import './Homepage.css';

const Homepage = () => {
  const { useToken } = theme;
  const { token } = useToken();
  const navigate = useNavigate();
  const [hoveredFeatureId, setHoveredFeatureId] = useState(null);

  const menuOptions = [
    {
      id: 'collections',
      title: 'Collections',
      icon: <Library size={48} />,
      path: '/collections',
      description: 'Organize and manage your private art galleries and exhibitions.'
    },
    {
      id: 'artwork',
      title: 'Artwork',
      icon: <Image size={48} />,
      path: '/artworks',
      description: 'Comprehensive database of your art pieces, including metadata and history.'
    },
    {
      id: 'artists',
      title: 'Artists',
      icon: <Users size={48} />,
      path: '/artists',
      description: 'Detailed biographical records and association history for artists in your collection.'
    },
    {
      id: 'appraisals',
      title: 'Appraisals',
      icon: <ShieldCheck size={48} />,
      path: '/appraisals',
      description: 'Track professional valuations, condition reports, and insurance documentation.'
    }
  ];

  const activeDescription = menuOptions.find(opt => opt.id === hoveredFeatureId)?.description || '';

  return (
    <div className="dashboard-content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, color: '#1e293b', fontSize: '2.25rem', fontWeight: 700 }}>Arteco Collection Management</h1>
        <p style={{ color: '#64748b', marginTop: '12px', fontSize: '1.125rem' }}>Select a module to manage your collections.</p>
      </div>
      
      <div className="options-grid">
        {menuOptions.map((option) => (
          <div 
            key={option.id} 
            className="option-card" 
            onClick={() => navigate(option.path)}
            onMouseEnter={() => setHoveredFeatureId(option.id)}
            onMouseLeave={() => setHoveredFeatureId(null)}
          >
            <div className="option-icon" style={{ color: token.colorPrimary }}>{option.icon}</div>
            <h2 style={{ color: '#1e293b' }}>{option.title}</h2>
          </div>
        ))}
      </div>

      <FeatureDescription 
        description={activeDescription} 
        isVisible={!!hoveredFeatureId} 
      />
    </div>
  );
};

export default Homepage;