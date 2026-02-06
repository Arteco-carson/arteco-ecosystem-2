import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select, Typography, Skeleton, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

// Standard ISO Language Codes
const languageOptions = [
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'English (US)', value: 'en-US' },
    { label: 'French', value: 'fr-FR' },
    { label: 'Spanish', value: 'es-ES' },
    { label: 'German', value: 'de-DE' },
    { label: 'Italian', value: 'it-IT' },
    { label: 'Chinese (Simplified)', value: 'zh-CN' },
];

export const ProfileModal = ({ open, onClose }) => {
  const { user, login } = useAuth(); 
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
        // --- AUTH CONFIG ---
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Load Reference Data
        const [typesRes, subTypesRes] = await Promise.all([
            axios.get(`${apiBase}/api/UserTypes`, config),
            axios.get(`${apiBase}/api/UserSubTypes`, config)
        ]);

        setTypes(typesRes.data);
        setSubTypes(subTypesRes.data);

        // 2. Load User Profile
        const profileRes = await axios.get(`${apiBase}/api/UserController/profile`, config);
        const profile = profileRes.data;

        // 3. Set Form Values
        form.setFieldsValue({
            firstName: profile.firstName,
            lastName: profile.lastName,
            telephoneNumber: profile.telephoneNumber,
            emailAddress: profile.emailAddress, // Read only usually
            userTypeId: profile.userTypeId,
            userSubTypeId: profile.userSubTypeId,
            // NEW: Load Language or Default
            preferredLanguage: profile.preferredLanguage || 'en-GB'
        });

        // Trigger subtype filter logic based on loaded type
        if (profile.userTypeId) {
            const filtered = subTypesRes.data.filter(st => st.userTypeId === profile.userTypeId);
            setAvailableSubTypes(filtered);
        }

    } catch (error) {
        console.error("Profile load error", error);
        messageApi.error("Failed to load profile data");
    } finally {
        setDataLoading(false);
    }
  };

  const handleTypeChange = (value) => {
    // Filter subtypes when type changes
    const filtered = subTypes.filter(st => st.userTypeId === value);
    setAvailableSubTypes(filtered);
    form.setFieldsValue({ userSubTypeId: null }); // Reset subtype
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Send Update (Payload matches UpdateProfileRequest.cs)
        const payload = {
            firstName: values.firstName,
            lastName: values.lastName,
            telephoneNumber: values.telephoneNumber,
            userTypeId: values.userTypeId,
            userSubTypeId: values.userSubTypeId,
            preferredLanguage: values.preferredLanguage 
        };

        const response = await axios.put(`${apiBase}/api/UserController/current`, payload, config);

        // Update Context
        login(response.data, token); 

        messageApi.success("Profile updated successfully");
        onClose();
    } catch (error) {
        console.error("Update error", error);
        messageApi.error("Failed to update profile");
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={<Title level={3}>Edit Profile</Title>}
        open={open}
        onCancel={onClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        {dataLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : (
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ 
                    preferredLanguage: 'en-GB' 
                }}
            >
                <Divider orientation="left">Personal Information</Divider>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="firstName" label="First Name" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>
                </div>

                <Form.Item name="emailAddress" label="Email Address">
                    <Input prefix={<MailOutlined />} disabled />
                </Form.Item>

                <Divider orientation="left">Contact & Preferences</Divider>
                <div style={{ display: 'flex', gap: '16px' }}>
                     <Form.Item name="telephoneNumber" label="Phone" style={{ flex: 1 }}>
                        <Input prefix={<PhoneOutlined />} placeholder="+44..." /> 
                     </Form.Item>
                     {/* NEW LANGUAGE FIELD */}
                     <Form.Item name="preferredLanguage" label="Language" style={{ flex: 1 }}>
                        <Select showSearch options={languageOptions} placeholder="Select Language" />
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