import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select, Typography, Skeleton, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

export const ProfileModal = ({ open, onClose }) => {
  const { user, login } = useAuth(); // We need 'login' to update the local user state after save
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Reference Data
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [availableSubTypes, setAvailableSubTypes] = useState([]);
  
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (open) {
      loadFullProfile();
    }
  }, [open]);

  const loadFullProfile = async () => {
    setDataLoading(true);
    try {
        // 1. Parallel Fetch: Get Types, SubTypes, and the Fresh User Profile
        // We use the '/me' convention or fallback to user ID if your API requires it
        const [typeRes, subTypeRes, profileRes] = await Promise.all([
            axios.get(`${apiBase}/api/UserTypes`),
            axios.get(`${apiBase}/api/UserSubTypes`),
            // Note: If you haven't built a specific '/me' endpoint, we might need to fetch by ID. 
            // For now, we assume the backend supports getting the current user's profile via the token.
            axios.get(`${apiBase}/api/UserProfile/current`) 
        ]);

        setTypes(typeRes.data);
        setSubTypes(subTypeRes.data);

        const userData = profileRes.data;

        // 2. Hydrate Form (Explicit Mapping)
        form.setFieldsValue({
            username: userData.username,
            email: userData.emailAddress, // SCHEMA MAPPING: emailAddress -> email
            firstName: userData.firstName,
            lastName: userData.lastName,
            telephoneNumber: userData.telephoneNumber,
            userTypeId: userData.userTypeId,
            userSubTypeId: userData.userSubTypeId
        });

        // 3. Filter SubTypes immediately based on the fetched Type
        if (userData.userTypeId) {
            const filtered = subTypeRes.data.filter(s => s.userTypeId === userData.userTypeId);
            setAvailableSubTypes(filtered);
        }

    } catch (error) {
        console.error("Failed to load profile", error);
        // Fallback: Use the 'user' prop from context if API fails
        if (user) {
            form.setFieldsValue(user);
        }
    } finally {
        setDataLoading(false);
    }
  };

  const handleTypeChange = (value) => {
      const filtered = subTypes.filter(s => s.userTypeId === value);
      setAvailableSubTypes(filtered);
      form.setFieldsValue({ userSubTypeId: null });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Send Update to Backend
      // Map 'email' back to 'emailAddress' for the DTO
      const payload = {
          ...values,
          emailAddress: values.email 
      };

      await axios.put(`${apiBase}/api/UserProfile/current`, payload);
      
      messageApi.success('Profile updated successfully');
      
      // 2. CRITICAL: Update Local Context so the Header Name changes instantly
      // We re-login with the same token but force a user refresh (simplest way)
      // Or manually update the user object if your AuthContext supports it.
      // For now, we rely on the next page refresh or explicit context update.
      
      onClose();
      // Optional: window.location.reload(); // To force header update if Context is rigid
    } catch (error) {
      console.error(error);
      messageApi.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title="My Profile"
        onCancel={onClose}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        {dataLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : (
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Divider orientation="left">Personal Details</Divider>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="firstName" label="First Name" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="lastName" label="Last Name" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                     <Form.Item name="email" label="Email Address" style={{ flex: 1 }}>
                        <Input prefix={<MailOutlined />} disabled /> 
                     </Form.Item>
                     <Form.Item name="telephoneNumber" label="Phone" style={{ flex: 1 }}>
                        <Input prefix={<PhoneOutlined />} placeholder="+44..." /> 
                     </Form.Item>
                </div>

                <Divider orientation="left">Ecosystem Role</Divider>
                <div style={{ display: 'flex', gap: '16px' }}>
                     <Form.Item name="userTypeId" label="Profile Type" style={{ flex: 1 }}>
                        <Select onChange={handleTypeChange}>
                            {types.map(t => <Option key={t.userTypeId} value={t.userTypeId}>{t.userTypeName}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="userSubTypeId" label="Specialism" style={{ flex: 1 }}>
                        <Select disabled={!availableSubTypes.length}>
                            {availableSubTypes.map(st => <Option key={st.subTypeId} value={st.subTypeId}>{st.subTypeName}</Option>)}
                        </Select>
                    </Form.Item>
                </div>

                <Divider />

                <div style={{ textAlign: 'right' }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>Save Changes</Button>
                </div>
            </Form>
        )}
      </Modal>
    </>
  );
};