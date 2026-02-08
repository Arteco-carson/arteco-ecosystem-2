import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Table, Row, Col, Card, Image, Spin, Empty, theme, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; 

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const GroupDetail = () => {
  // Note: Your router might use 'id' or 'groupId'. 
  // Based on your previous logs, it seemed to be 'id', but your file said 'groupId'.
  // This line handles both cases safely.
  const params = useParams();
  const groupId = params.groupId || params.id;
  
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null); 
  const [artworks, setArtworks] = useState([]); 
  const [selectedArtwork, setSelectedArtwork] = useState(null); 

  // --- ERROR HANDLER ---
  const showErrorAlert = (context, error) => {
    console.error(context, error);
    let serverMsg = "Unknown Error";
    let innerMsg = "";
    
    if (error.response && error.response.data) {
        serverMsg = error.response.data.message || JSON.stringify(error.response.data);
        innerMsg = error.response.data.error || error.response.data.inner || "";
    } else {
        serverMsg = error.message;
    }

    // Aggressive Alert as requested
    alert(`⚠️ DEBUG ERROR (${context}) ⚠️\n\nServer: ${serverMsg}\nDetails: ${innerMsg}`);
    messageApi.error(`Error: ${serverMsg}`);
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Single call to the endpoint we created in CollectionsController
        // It returns { subGroupId, name, ..., artworks: [] }
        const response = await api.get(`/api/collections/subgroup/${groupId}?t=${new Date().getTime()}`);
        
        const data = response.data;
        setGroup(data);
        
        // The controller sends 'artworks' inside the main object
        const items = data.artworks || [];
        setArtworks(items);
        
        if (items.length > 0) {
            setSelectedArtwork(items[0]);
        }
      } catch (error) {
        showErrorAlert("Fetch Group", error);
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
      dataIndex: 'imageUrl', // Changed from 'artworkImages' to match backend DTO
      key: 'image',
      width: 80,
      render: (url) => {
        return url ? (
            <img src={url} alt="thumb" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
        ) : (
            <div style={{width: 40, height: 40, background: '#f0f0f0', borderRadius: 4}} />
        );
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
      dataIndex: 'artistName', // Changed from 'artist' object to 'artistName' string (from DTO)
      key: 'artist',
      render: (text) => text || '-'
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
      {contextHolder}
      
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
                <Title level={5} type="secondary" style={{ marginTop: 0 }}>{group.collectionName}</Title>
                <Paragraph type="secondary">{group.description || "No description provided."}</Paragraph>
                
                <div style={{ marginTop: 24 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Stats</Text>
                    <Card size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Items</Text>
                            <Text strong>{artworks.length}</Text>
                        </div>
                        {/* Note: The backend DTO doesn't currently send CreatedAt for the Group, so we hide it to prevent "Invalid Date" */}
                        {group.createdAt && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                <Text>Created</Text>
                                <Text type="secondary">{new Date(group.createdAt).toLocaleDateString()}</Text>
                            </div>
                        )}
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
                            <Col span={24} md={14} style={{ background: '#f9f9f9', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selectedArtwork.imageUrl ? (
                                    <Image 
                                        src={selectedArtwork.imageUrl} 
                                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Empty description="No Image" />
                                )}
                            </Col>
                            <Col span={24} md={10} style={{ padding: 24 }}>
                                <Title level={3}>{selectedArtwork.title}</Title>
                                <Title level={5} type="secondary" style={{ marginTop: 0 }}>
                                    {selectedArtwork.artistName || 'Unknown Artist'}
                                </Title>
                                <div style={{ marginTop: 24 }}>
                                    <Paragraph><strong>Medium:</strong> {selectedArtwork.medium || 'N/A'}</Paragraph>
                                    <Paragraph><strong>Dimensions:</strong> {selectedArtwork.dimensions || 'N/A'}</Paragraph>
                                    <Paragraph><strong>Year:</strong> {selectedArtwork.yearCreated || 'N/A'}</Paragraph>
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