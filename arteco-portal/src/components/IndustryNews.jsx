import React from 'react';
import { Card, List, Typography, Tag } from 'antd';

const data = [
  {
    title: 'Global Art Market Report 2025',
    description: 'The art market shows resilience amidst global economic shifts.',
    tag: 'Market'
  },
  {
    title: 'New Conservation Techniques',
    description: 'Breakthrough in restoring 17th-century oil paintings using nanotechnology.',
    tag: 'Technology'
  },
  {
    title: 'Upcoming Auction Highlights',
    description: 'Preview of the masterworks available at the Spring Auction in London.',
    tag: 'Events'
  },
  {
    title: 'Sustainable Logistics in Art Transport',
    description: 'How major galleries are reducing their carbon footprint.',
    tag: 'Logistics'
  }
];

const IndustryNews = () => (
  <div style={{ marginTop: 40, width: '100%' }}>
    <Typography.Title level={3} style={{ textAlign: 'left', fontSize: '24px' }}>Industry News</Typography.Title>
    <List
      grid={{ gutter: 16, column: 2 }}
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <Card 
            title={<span style={{ fontSize: '18px' }}>{item.title}</span>} 
            size="small"
          >
             <div style={{ marginBottom: 10 }}>
                <Tag color="blue" style={{ fontSize: '14px', padding: '2px 8px' }}>{item.tag}</Tag>
             </div>
             <Typography.Text style={{ fontSize: '16px' }}>{item.description}</Typography.Text>
          </Card>
        </List.Item>
      )}
    />
  </div>
);

export default IndustryNews;
