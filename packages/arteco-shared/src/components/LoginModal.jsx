import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Text, Link } = Typography;

export const LoginModal = ({ open, onClose }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // Toggle state
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Reset form when switching modes
  const toggleMode = () => {
    setIsRegister(!isRegister);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);

    // --- CONSTRUCT API URL ---
    // Uses the environment variable if available (Production), otherwise falls back to relative path (Localhost Proxy)
    const apiBase = import.meta.env.VITE_API_URL || '';
    const endpoint = isRegister 
      ? `${apiBase}/api/auth/register` 
      : `${apiBase}/api/auth/login`;

    // Prepare Payload
    let payload = { ...values };
    
    // INJECT REQUIRED DEFAULTS FOR REGISTRATION
    if (isRegister) {
      payload = {
        ...payload,
        roleId: 2,         // 2 = Standard User/Customer
        userTypeId: 1,     // 1 = Standard Type
        marketingConsent: true
      };
    }

    try {
      const response = await axios.post(endpoint, payload);

      if (isRegister) {
        // --- REGISTRATION SUCCESS ---
        messageApi.success('Account created! Please sign in.');
        
        // If API sends a token immediately, log in. 
        // If not, switch to login view and pre-fill username.
        if (response.data.token) {
           localStorage.setItem('token', response.data.token);
           login(response.data.token);
           onClose();
        } else {
           setIsRegister(false);
           // Pre-fill the username they just created so they don't have to retype it
           form.setFieldsValue({ username: values.username }); 
        }

      } else {
        // --- LOGIN SUCCESS ---
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
      // specific error message from Azure API
      const errorMsg = error.response?.data?.message || error.response?.data;
      
      // Handle "Duplicate" or "Validation" errors nicely
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
        title={isRegister ? "Create Arteco Account" : "Sign In to Arteco"}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        centered
        width={400}
      >
        <Form
          form={form}
          name="auth_modal"
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
        >
          {/* --- REGISTRATION ONLY FIELDS --- */}
          {isRegister && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input prefix={<IdcardOutlined />} placeholder="First Name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastName"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input prefix={<IdcardOutlined />} placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Invalid email format' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email Address" size="large" />
              </Form.Item>
            </>
          )}

          {/* --- SHARED FIELDS --- */}
          <Form.Item
            name="username"
            label={isRegister ? "Choose a Username" : null}
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          {/* --- ACTION BUTTON --- */}
          <Form.Item style={{ marginBottom: 10 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </Form.Item>
          
          {/* --- TOGGLE --- */}
          <div style={{ textAlign: 'center' }}>
             <Text type="secondary">
               {isRegister ? "Already have an account? " : "Don't have an account? "}
             </Text>
             <Link onClick={toggleMode} style={{ fontWeight: 'bold' }}>
               {isRegister ? "Sign In" : "Register Now"}
             </Link>
          </div>

        </Form>
      </Modal>
    </>
  );
};