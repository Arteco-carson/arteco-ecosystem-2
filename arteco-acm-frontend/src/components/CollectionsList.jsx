import React, { useEffect, useState } from 'react';
import { Button, Layout, Typography, Modal, Input, Form, Spin, message, theme } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../api'; 
import CollectionRow from './CollectionRow';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const CollectionsList = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [form] = Form.useForm();
  
  const { token } = theme.useToken();
  
  // Environment variable for Portal URL
  const portalUrl = import.meta.env.VITE_PORTAL_URL || '/';

  // --- HELPER: Aggressive Error Revealer ---
  const showErrorAlert = (context, error) => {
    console.error(context, error);
    
    // Extract the hidden error message from the backend
    let serverMsg = "Unknown Error";
    let innerMsg = "";
    
    if (error.response && error.response.data) {
        // Check for our custom debug format
        serverMsg = error.response.data.message || JSON.stringify(error.response.data);
        innerMsg = error.response.data.error || error.response.data.inner || "";
    } else {
        serverMsg = error.message;
    }

    // Force the user to see it
    alert(`⚠️ DEBUG ERROR (${context}) ⚠️\n\nServer Message: ${serverMsg}\n\nDetails: ${innerMsg}`);
    message.error(`Error: ${serverMsg}`);
  };

  // --- Data Fetching ---
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/collections');
      setCollections(response.data);
    } catch (error) {
      showErrorAlert("Loading Collections", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // --- Handlers ---
  const handleCreateCollection = async (values) => {
    try {
      await api.post('/api/collections', {
        name: values.name,
        description: values.description
      });
      message.success('Collection created');
      setIsCollectionModalVisible(false);
      form.resetFields();
      fetchCollections(); 
    } catch (error) {
      showErrorAlert("Creating Collection", error);
    }
  };

  const handleCreateGroup = async (values) => {
    try {
      await api.post('/api/collections/subgroup', {
        collectionId: selectedCollectionId,
        name: values.name,
        description: values.description
      });
      message.success('Group added');
      setIsGroupModalVisible(false);
      form.resetFields();
      fetchCollections(); 
    } catch (error) {
       showErrorAlert("Creating Group", error);
    }
  };

  const openGroupModal = (collectionId) => {
    setSelectedCollectionId(collectionId);
    setIsGroupModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0' 
      }}>
        <Button type="link" icon={<ArrowLeftOutlined />} href={portalUrl} style={{ color: token.colorText }}>
          Return to portal
        </Button>
        <Button 
          type="primary" 
          shape="round" 
          icon={<PlusOutlined />} 
          onClick={() => setIsCollectionModalVisible(true)}
          style={{ backgroundColor: token.colorPrimary }}
        >
          Add Collection
        </Button>
      </div>

      <Content style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Spin size="large" />
          </div>
        ) : collections.length === 0 ? (
          /* Empty State */
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <Title level={3}>No Collections Yet</Title>
            <Text type="secondary">Create your first collection to start organizing your inventory.</Text>
            <br />
            <Button 
              type="primary" 
              shape="round" 
              icon={<PlusOutlined />} 
              onClick={() => setIsCollectionModalVisible(true)}
              style={{ marginTop: '24px' }}
            >
              Add Collection
            </Button>
          </div>
        ) : (
          /* Populated State */
          <div>
            {collections.map(col => (
              <CollectionRow 
                key={col.collectionId} 
                collection={col} 
                onAddGroup={openGroupModal} 
              />
            ))}
          </div>
        )}
      </Content>

      {/* --- Modals --- */}
      
      <Modal
        title="New Collection"
        open={isCollectionModalVisible}
        onCancel={() => setIsCollectionModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={handleCreateCollection} layout="vertical" preserve={false}>
          <Form.Item name="name" label="Collection Name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input placeholder="e.g. Summer Auction 2026" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Group"
        open={isGroupModalVisible}
        onCancel={() => setIsGroupModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={handleCreateGroup} layout="vertical" preserve={false}>
          <Form.Item name="name" label="Group Name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input placeholder="e.g. Oils, Sculptures" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

    </Layout>
  );
};

export default CollectionsList;