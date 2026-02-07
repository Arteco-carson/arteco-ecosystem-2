import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Table, Row, Col, Card, Image, Spin, Empty, theme } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; // Local api import as per your structure

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null); // Metadata
  const [artworks, setArtworks] = useState([]); // Items
  const [selectedArtwork, setSelectedArtwork] = useState(null); // For Main Area

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Group Metadata (We might need a specific endpoint or just fetch the collection)
        // For efficiency, let's assume we have an endpoint for the group details directly
        const groupRes = await api.get(`/api/collections/subgroup/${groupId}`);
        setGroup(groupRes.data);

        // 2. Get Items in Group
        const itemsRes = await api.get(`/api/collections/subgroup/${groupId}/items`);
        setArtworks(itemsRes.data);
        
        // Default to first item if available
        if (itemsRes.data && itemsRes.data.length > 0) {
            setSelectedArtwork(itemsRes.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch group", error);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) fetchData();
  }, [groupId]);

  // --- Table Columns ---
  const columns = [
    {
      title: 'Art',
      dataIndex: 'artworkImages',
      key: 'image',
      width: 80,
      render: (images) => {
        const thumb = images && images.length > 0 ? images.find(i => i.isPrimary)?.blobUrl || images[0].blobUrl : null;
        return thumb ? <img src={thumb} alt="thumb" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : <div style={{width: 40, height: 40, background: '#f0f0f0', borderRadius: 4}} />;
      }
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Artist',
      dataIndex: 'artist',
      key: 'artist',
      render: (artist) => artist ? `${artist.firstName} ${artist.lastName}` : '-'
    },
    {
        title: '',
        key: 'action',
        render: (_, record) => (
            <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); navigate(`/artwork/${record.artworkId}`) }}>
                View
            </Button>
        )
    }
  ];

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  if (!group) return <Empty description="Group not found" style={{ marginTop: 100 }} />;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/collections')}>
          Back to Collections
        </Button>
      </div>

      <Content style={{ padding: '24px' }}>
        <Row gutter={32}>
          
          {/* LEFT: Group Info (Narrow) */}
          <Col xs={24} md={6}>
            <div style={{ position: 'sticky', top: 24 }}>
                <Title level={2} style={{ marginTop: 0 }}>{group.name}</Title>
                <Paragraph type="secondary">{group.description || "No description provided."}</Paragraph>
                
                <div style={{ marginTop: 24 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Stats</Text>
                    <Card size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Items</Text>
                            <Text strong>{artworks.length}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                            <Text>Created</Text>
                            <Text type="secondary">{new Date(group.createdAt).toLocaleDateString()}</Text>
                        </div>
                    </Card>
                </div>
            </div>
          </Col>

          {/* RIGHT: Main Area + List (Wide) */}
          <Col xs={24} md={18}>
            
            {/* Main Area: Selected Item Preview */}
            <div style={{ marginBottom: 32 }}>
                {selectedArtwork ? (
                    <Card bodyStyle={{ padding: 0 }} style={{ overflow: 'hidden' }}>
                        <Row>
                            <Col span={14} style={{ background: '#f9f9f9', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selectedArtwork.artworkImages && selectedArtwork.artworkImages.length > 0 ? (
                                    <Image 
                                        src={selectedArtwork.artworkImages.find(i => i.isPrimary)?.blobUrl || selectedArtwork.artworkImages[0].blobUrl} 
                                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Empty description="No Image" />
                                )}
                            </Col>
                            <Col span={10} style={{ padding: 24 }}>
                                <Title level={3}>{selectedArtwork.title}</Title>
                                <Title level={5} type="secondary" style={{ marginTop: 0 }}>
                                    {selectedArtwork.artist ? `${selectedArtwork.artist.firstName} ${selectedArtwork.artist.lastName}` : 'Unknown Artist'}
                                </Title>
                                <div style={{ marginTop: 24 }}>
                                    <Paragraph><strong>Medium:</strong> {selectedArtwork.medium}</Paragraph>
                                    <Paragraph><strong>Dimensions:</strong> {selectedArtwork.heightCM} x {selectedArtwork.widthCM} cm</Paragraph>
                                    <Paragraph><strong>Valuation:</strong> £{selectedArtwork.acquisitionCost?.toLocaleString()}</Paragraph>
                                </div>
                                <Button type="primary" onClick={() => navigate(`/artwork/${selectedArtwork.artworkId}`)} style={{ marginTop: 16 }}>
                                    Open Full Record
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                ) : (
                    <Empty description="Select an item to preview" />
                )}
            </div>

            {/* List of Items */}
            <Title level={4}>Items in this Group</Title>
            <Table 
                dataSource={artworks} 
                columns={columns} 
                rowKey="artworkId"
                pagination={false}
                onRow={(record) => ({
                    onClick: () => setSelectedArtwork(record),
                    style: { cursor: 'pointer', background: selectedArtwork?.artworkId === record.artworkId ? token.colorPrimaryBg : 'transparent' }
                })}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default GroupDetail;