import React, { useRef } from 'react';
import { Card, Button, Typography, Space, theme } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const CollectionRow = ({ collection, onAddGroup }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // Scroll Logic
  const scroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += scrollOffset;
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Row Header */}
      <div style={{ marginBottom: '12px', paddingLeft: '4px' }}>
        <Title level={4} style={{ margin: 0 }}>
          {collection.collectionName || collection.name}
        </Title>
        <Text type="secondary">{collection.description}</Text>
      </div>

      {/* The Scroll Container Wrapper */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        
        {/* Left Scroll Button */}
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={() => scroll(-300)}
          style={{ 
            position: 'absolute', 
            left: 0, 
            zIndex: 10, 
            height: '100%', 
            background: 'rgba(255,255,255,0.8)' 
          }} 
        />

        {/* Horizontal Scroll Strip */}
        <div 
          ref={scrollRef}
          style={{ 
            display: 'flex', 
            gap: '16px', 
            overflowX: 'auto', 
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none', // Firefox
            padding: '4px 40px', // Pad for buttons
            width: '100%',
            whiteSpace: 'nowrap'
          }}
          className="hide-scrollbar" // Add this class to CSS if needed to hide chrome scrollbar
        >
          {/* Sub-Group Tiles */}
          {collection.subGroups && collection.subGroups.map((group) => (
            <Card
              key={group.subGroupId}
              hoverable
              onClick={() => navigate(`/collections/group/${group.subGroupId}`)}
              style={{ 
                minWidth: '200px', 
                width: '200px', 
                textAlign: 'center',
                borderColor: token.colorBorderSecondary 
              }}
              bodyStyle={{ padding: '24px 12px' }}
            >
              <Space direction="vertical" align="center">
                <FolderOpenOutlined style={{ fontSize: '32px', color: token.colorPrimary }} />
                <Text strong>{group.name}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {group.artworks ? group.artworks.length : 0} items
                </Text>
              </Space>
            </Card>
          ))}

          {/* Add Group Button (End of Strip) */}
          <div style={{ minWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button 
              shape="circle" 
              icon={<PlusOutlined />} 
              size="large"
              onClick={() => onAddGroup(collection.collectionId)}
              title="Add Group"
            />
          </div>
        </div>

        {/* Right Scroll Button */}
        <Button 
          type="text" 
          icon={<RightOutlined />} 
          onClick={() => scroll(300)}
          style={{ 
            position: 'absolute', 
            right: 0, 
            zIndex: 10, 
            height: '100%', 
            background: 'rgba(255,255,255,0.8)' 
          }} 
        />
      </div>
    </div>
  );
};

export default CollectionRow;