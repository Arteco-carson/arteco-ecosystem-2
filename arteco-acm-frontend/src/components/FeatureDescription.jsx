import React from 'react';
import { Typography, Grid } from 'antd';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const FeatureDescription = ({ description, isVisible }) => {
  const screens = useBreakpoint();

  // Hide on mobile devices (xs and sm screens)
  if (!screens.md && (screens.xs || screens.sm)) {
    return null;
  }

  return (
    <div 
      style={{ 
        minHeight: '40px', 
        marginTop: '32px', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <Text 
        style={{ 
          fontSize: '1.25rem', 
          color: '#64748b',
          fontWeight: 400,
          fontStyle: 'italic'
        }}
      >
        {description}
      </Text>
    </div>
  );
};

export default FeatureDescription;
