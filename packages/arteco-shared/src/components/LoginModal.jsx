import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Typography, Row, Col, Select, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, GlobalOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Text, Link } = Typography;
const { Option } = Select;

// Standard ISO Language Codes (Same as ProfileModal)
const languageOptions = [
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'English (US)', value: 'en-US' },
    { label: 'French', value: 'fr-FR' },
    { label: 'Spanish', value: 'es-ES' },
    { label: 'German', value: 'de-DE' },
    { label: 'Italian', value: 'it-IT' },
    { label: 'Chinese (Simplified)', value: 'zh-CN' },
];

export const LoginModal = ({ open, onClose }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  // State for Dropdowns
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [availableSubTypes, setAvailableSubTypes] = useState([]);
  
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const apiBase = import.meta.env.VITE_API_URL || '';

  // 1. Fetch Types when Registration opens
  useEffect(() => {
    if (open && isRegister) {
      const fetchRefData = async () => {
        try {
          const typeRes = await axios.get(`${apiBase}/api/UserTypes`);
          setTypes(typeRes.data);
          const subTypeRes = await axios.get(`${apiBase}/api/UserSubTypes`);
          setSubTypes(subTypeRes.data);
        } catch (err) {
          console.warn('API not ready. Using fallback data.');
          // Fallback so UI works even if Backend isn't deployed yet
          setTypes([
            { userTypeId: 1, userTypeName: 'Creator' }, 
            { userTypeId: 2, userTypeName: 'Exhibitor / Dealer' },
            { userTypeId: 3, userTypeName: 'Service Provider' },
            { userTypeId: 4, userTypeName: 'Buyer / Collector' }
          ]);
        }
      };
      fetchRefData();
    }
  }, [open, isRegister]);

  // 2. Filter SubTypes when Type changes
  const handleTypeChange = (value) => {
    if (subTypes.length > 0) {
      const filtered = subTypes.filter(s => s.userTypeId === value);
      setAvailableSubTypes(filtered);
    } else {
       // Minimal fallback if API failed
       setAvailableSubTypes([{ subTypeId: 999, subTypeName: 'Loading...' }]); 
    }
    form.setFieldsValue({ userSubTypeId: undefined });
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    const endpoint = isRegister ? `${apiBase}/api/auth/register` : `${apiBase}/api/auth/login`;

    let payload = { ...values };
    
    // 3. Inject IDs
    if (isRegister) {
      payload = {
        ...payload,
        roleId: 2,         // Standard User
        marketingConsent: true,
        userTypeId: values.userTypeId,
        userSubTypeId: values.userSubTypeId,
        preferredLanguage: values.preferredLanguage // Explicitly ensure this is passed
      };
    }

    try {
      const response = await axios.post(endpoint, payload);

      if (isRegister) {
        messageApi.success('Account created! Please sign in.');
        if (response.data.token) {
           localStorage.setItem('token', response.data.token);
           login(response.data.token);
           onClose();
        } else {
           setIsRegister(false);
           form.setFieldsValue({ username: values.username }); 
        }
      } else {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          messageApi.success('Welcome back!');
          login(response.data.token);
          onClose();
        } else {
          messageApi.error('Login failed: No token received.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data;
      if (typeof errorMsg === 'string' && errorMsg.includes("taken")) {
         messageApi.error("That username is already taken.");
      } else {
         messageApi.error(typeof errorMsg === 'string' ? errorMsg : 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={isRegister ? "Join the Ecosystem" : "Sign In to Arteco"}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        centered
        width={450}
      >
        <Form
          form={form}
          name="auth_modal"
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
          initialValues={{ preferredLanguage: 'en-GB' }} // Default to UK English
        >
          {isRegister && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="firstName" rules={[{ required: true, message: 'Required' }]}>
                    <Input prefix={<IdcardOutlined />} placeholder="First Name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lastName" rules={[{ required: true, message: 'Required' }]}>
                    <Input prefix={<IdcardOutlined />} placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <Input prefix={<MailOutlined />} placeholder="Email Address" />
              </Form.Item>

              {/* NEW: Preferred Language Dropdown */}
              <Form.Item name="preferredLanguage" rules={[{ required: true, message: 'Please select a language' }]}>
                <Select 
                    prefix={<GlobalOutlined />} 
                    placeholder="Preferred Language"
                    options={languageOptions}
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />
              </Form.Item>

              <Divider dashed style={{ margin: '12px 0' }}><Text type="secondary" style={{fontSize: 12}}>Profile Type</Text></Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="userTypeId" rules={[{ required: true, message: 'Select Type' }]}>
                    <Select placeholder="I am a..." onChange={handleTypeChange}>
                      {types.map(t => (
                        <Option key={t.userTypeId} value={t.userTypeId}>{t.userTypeName}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="userSubTypeId" rules={[{ required: true, message: 'Select Sub-Type' }]}>
                    <Select placeholder="Specifically..." disabled={!availableSubTypes.length}>
                       {availableSubTypes.map(st => (
                         <Option key={st.subTypeId} value={st.subTypeId}>{st.subTypeName}</Option>
                       ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Divider dashed style={{ margin: '12px 0' }} />
            </>
          )}

          <Form.Item name="username" rules={[{ required: true, message: 'Please enter a username' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 10 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
             <Text type="secondary">{isRegister ? "Already have an account? " : "Don't have an account? "}</Text>
             <Link onClick={toggleMode} style={{ fontWeight: 'bold' }}>{isRegister ? "Sign In" : "Register Now"}</Link>
          </div>
        </Form>
      </Modal>
    </>
  );
};