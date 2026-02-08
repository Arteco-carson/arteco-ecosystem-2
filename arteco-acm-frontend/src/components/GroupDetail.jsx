import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Table, Row, Col, Card, Image, Spin, Empty, theme, message, Modal, List, Checkbox, Space } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; 

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const GroupDetail = () => {
  const params = useParams();
  const groupId = params.groupId || params.id;
  
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null); 
  const [artworks, setArtworks] = useState([]); 
  const [selectedArtwork, setSelectedArtwork] = useState(null); 

  // --- Add Items Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allArtworks, setAllArtworks] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  // --- Error Handler (Restored to standard UI) ---
  const handleApiError = (context, error) => {
    console.error(context, error);
    let msg = error.message;
    if (error.response && error.response.data) {
        msg = error.response.data.message || "Server Error";
    }
    messageApi.error(msg);
  };

  // --- Fetch Group Data ---
  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/collections/subgroup/${groupId}?t=${new Date().getTime()}`);
      const data = response.data;
      setGroup(data);
      const items = data.artworks || [];
      setArtworks(items);
      
      // Select first item by default if nothing selected yet
      if (items.length > 0 && !selectedArtwork) {
          setSelectedArtwork(items[0]);
      }
    } catch (error) {
      handleApiError("Fetch Group", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchGroupData();
  }, [groupId]);

  // --- Fetch All Artworks (For Modal) ---
  const openAddModal = async () => {
    setIsAddModalOpen(true);
    setLoadingAll(true);
    try {
        const response = await api.get('/api/artworks'); // Standard endpoint
        setAllArtworks(response.data);
    } catch (error) {
        handleApiError("Load All Artworks", error);
    } finally {
        setLoadingAll(false);
    }
  };

  // --- Submit Added Items ---
  const handleAddItems = async () => {
    if (selectedToAdd.length === 0) return;
    try {
        await api.post('/api/collections/subgroup/items', {
            subGroupId: groupId,
            artworkIds: selectedToAdd
        });
        messageApi.success("Items added to group");
        setIsAddModalOpen(false);
        setSelectedToAdd([]);
        // Refresh data
        await fetchGroupData();
    } catch (error) {
        handleApiError("Add Items", error);
    }
  };

  // --- Table Columns ---
  const columns = [
    {
      title: 'Art',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 80,
      render: (url) => url ? (
            <img src={url} alt="thumb" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
        ) : (
            <div style={{width: 40, height: 40, background: '#f0f0f0', borderRadius: 4}} />
        )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Artist',
      dataIndex: 'artistName', 
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

  if (loading && !group) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  if (!group && !loading) return <Empty description="Group not found" style={{ marginTop: 100 }} />;

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
          
          {/* LEFT: Group Info */}
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
                    </Card>
                </div>
            </div>
          </Col>

          {/* RIGHT: Main Content */}
          <Col xs={24} md={18}>
            
            {/* Preview Area */}
            <div style={{ marginBottom: 32 }}>
                {selectedArtwork ? (
                    <Card bodyStyle={{ padding: 0 }} style={{ overflow: 'hidden' }}>
                        <Row>
                            <Col span={24} md={12} style={{ background: '#f9f9f9', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selectedArtwork.imageUrl ? (
                                    <Image 
                                        src={selectedArtwork.imageUrl} 
                                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Empty description="No Image" />
                                )}
                            </Col>
                            <Col span={24} md={12} style={{ padding: 24 }}>
                                <Title level={3}>{selectedArtwork.title}</Title>
                                <Title level={5} type="secondary">{selectedArtwork.artistName || 'Unknown Artist'}</Title>
                                <div style={{ marginTop: 24 }}>
                                    <Paragraph><strong>Medium:</strong> {selectedArtwork.medium || '-'}</Paragraph>
                                    <Paragraph><strong>Dimensions:</strong> {selectedArtwork.dimensions || '-'}</Paragraph>
                                    <Paragraph><strong>Year:</strong> {selectedArtwork.yearCreated || '-'}</Paragraph>
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

            {/* List Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Items in this Group</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                    Link Items
                </Button>
            </div>

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

      {/* --- Add Items Modal --- */}
      <Modal 
        title="Link Items to Group" 
        open={isAddModalOpen} 
        onCancel={() => setIsAddModalOpen(false)}
        onOk={handleAddItems}
        okText={`Add Selected (${selectedToAdd.length})`}
        width={600}
      >
        {loadingAll ? <Spin style={{ display: 'block', margin: '20px auto' }} /> : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Checkbox.Group style={{ width: '100%' }} value={selectedToAdd} onChange={setSelectedToAdd}>
                    <List
                        dataSource={allArtworks}
                        renderItem={item => (
                            <List.Item>
                                <Checkbox value={item.artworkId} style={{ width: '100%' }}>
                                    <Space>
                                        {item.imageUrl && <img src={item.imageUrl} alt="art" style={{ width: 30, height: 30, borderRadius: 2 }} />}
                                        <Text strong>{item.title}</Text>
                                        <Text type="secondary">({item.artistName || 'Unknown'})</Text>
                                        {/* Optional: Show if already in a group */}
                                        {item.subGroupId && <Text type="warning" style={{ fontSize: 10 }}>[Currently in another group]</Text>}
                                    </Space>
                                </Checkbox>
                            </List.Item>
                        )}
                    />
                </Checkbox.Group>
            </div>
        )}
      </Modal>

    </Layout>
  );
};

export default GroupDetail;