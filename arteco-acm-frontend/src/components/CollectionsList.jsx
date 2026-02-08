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
  
  // FIX: Use message hook to prevent context/theme crashes
  const [messageApi, contextHolder] = message.useMessage();
  
  // Modal States
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  
  // Forms
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  
  const { token } = theme.useToken();
  const portalUrl = import.meta.env.VITE_PORTAL_URL || '/';

  // --- ERROR HANDLER ---
  const showErrorAlert = (context, error) => {
    console.error(context, error);
    let serverMsg = "Unknown Error";
    
    if (error.response && error.response.data) {
        serverMsg = error.response.data.message || JSON.stringify(error.response.data);
    } else {
        serverMsg = error.message;
    }

    messageApi.error(`Error (${context}): ${serverMsg}`);
  };

  // --- DATA FETCHING ---
  const fetchCollections = async () => {
    try {
      setLoading(true);
      // Add timestamp to bypass cache
      const response = await api.get(`/api/collections?t=${new Date().getTime()}`);
      console.log("Loaded Collections:", response.data); 
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

  // --- HANDLERS ---
  const handleCreateCollection = async (values) => {
    try {
      await api.post('/api/collections', {
        name: values.name,
        description: values.description
      });
      messageApi.success('Collection created');
      setIsCollectionModalVisible(false);
      form.resetFields();
      await fetchCollections(); // Refresh list immediately
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
      messageApi.success('Group added');
      setIsGroupModalVisible(false);
      groupForm.resetFields();
      await fetchCollections(); // Refresh list immediately
    } catch (error) {
       showErrorAlert("Creating Group", error);
    }
  };

  // This function is passed to the Row
  const openGroupModal = (collectionId) => {
    setSelectedCollectionId(collectionId);
    setIsGroupModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {contextHolder} {/* REQUIRED: Renders the message toast */}
      
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
          <div>
            {collections.map(col => (
              <CollectionRow 
                key={col.collectionId} 
                collection={col} 
                // Passed as a reference, because the Row calls it with the ID
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
        <Form form={form} onFinish={handleCreateCollection} layout="vertical">
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
        onOk={() => groupForm.submit()}
        destroyOnClose
      >
        <Form form={groupForm} onFinish={handleCreateGroup} layout="vertical">
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